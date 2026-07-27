import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, authenticateToken, AuthRequest, Role, requireRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * Helper: test database connectivity. Throws if unreachable.
 */
async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // Check database connectivity first
    const dbOk = await testDbConnection();
    if (!dbOk) {
      console.error('[AUTH] Database connection FAILED during login attempt');
      return res.status(503).json({ 
        error: 'Database service unavailable. Please try again in a few moments.',
        code: 'DB_UNAVAILABLE'
      });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user && requestedRole) {
      user = await prisma.user.findFirst({ where: { role: requestedRole } });
    }

    if (!user) {
      // Log failed login attempt
      try {
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_FAILED',
            module: 'AUTHENTICATION',
            details: `Failed login attempt for email: ${email}`
          }
        });
      } catch {}
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password against hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed password attempt
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName: user.name,
            action: 'LOGIN_FAILED',
            module: 'AUTHENTICATION',
            details: `Failed login attempt for user ${user.name} (${user.email}) - invalid password`
          }
        });
      } catch {}
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'USER_LOGIN',
        module: 'AUTHENTICATION',
        details: `User ${user.name} logged in with role ${user.role}`
      }
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role
      }
    });
  } catch (error: any) {
    console.error('[AUTH] Login error:', error?.message || error);
    console.error('[AUTH] Full stack:', error?.stack || 'No stack trace available');
    // Return the actual error message + stack in development, generic message in production
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({ 
      error: 'Failed to process login',
      ...(isDev && { detail: error?.message || String(error) }),
      code: 'LOGIN_ERROR',
      ...(isDev && { prismaCode: error?.code || null })
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// GET /api/auth/users
router.get('/users', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// POST /api/auth/users
router.post('/users', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required for new staff members.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'WAITER',
        phone
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name,
        action: 'CREATE_STAFF',
        module: 'STAFF_MANAGEMENT',
        details: `Created new staff member ${name} (${role})`
      }
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// ==================== DATABASE SEED ENDPOINT ====================

// POST /api/auth/seed
// Seeds the database with demo users and data if no users exist.
// Useful for Render deployments where Shell access isn't convenient.
router.post('/seed', async (req: Request, res: Response) => {
  try {
    // Check if already seeded
    const existingUserCount = await prisma.user.count();
    if (existingUserCount > 0) {
      return res.status(400).json({
        error: 'Database is already seeded',
        userCount: existingUserCount
      });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create all 6 role users
    const users = await Promise.all([
      prisma.user.create({ data: { name: 'Praveen Yadav', email: 'owner@restaurantos.io', password: passwordHash, role: 'OWNER', phone: '+1-555-0192' } }),
      prisma.user.create({ data: { name: 'Arun Kumar', email: 'manager@restaurantos.io', password: passwordHash, role: 'MANAGER', phone: '+1-555-0193' } }),
      prisma.user.create({ data: { name: 'Chef Bharath', email: 'chef@restaurantos.io', password: passwordHash, role: 'CHEF', phone: '+1-555-0194' } }),
      prisma.user.create({ data: { name: 'Alex Rivers', email: 'waiter@restaurantos.io', password: passwordHash, role: 'WAITER', phone: '+1-555-0195' } }),
      prisma.user.create({ data: { name: 'Sarah Connor', email: 'cashier@restaurantos.io', password: passwordHash, role: 'CASHIER', phone: '+1-555-0196' } }),
      prisma.user.create({ data: { name: 'David Miller', email: 'store@restaurantos.io', password: passwordHash, role: 'STORE_MANAGER', phone: '+1-555-0197' } }),
    ]);

    console.log('[SEED] ✅ Created 6 role users (Owner, Manager, Chef, Waiter, Cashier, Store Manager)');

    return res.status(201).json({
      message: 'Database seeded successfully',
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
      loginHint: 'Use any email above with password: password123'
    });
  } catch (error: any) {
    console.error('[SEED] Error seeding database:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to seed database',
      detail: error?.message || String(error)
    });
  }
});

export default router;
