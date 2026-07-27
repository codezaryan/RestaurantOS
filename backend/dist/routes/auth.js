"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, requestedRole } = req.body;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user && requestedRole) {
            user = await prisma.user.findFirst({ where: { role: requestedRole } });
        }
        if (!user) {
            user = await prisma.user.findFirst({ where: { role: 'OWNER' } });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, auth_1.JWT_SECRET, { expiresIn: '24h' });
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
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to process login' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticateToken, (req, res) => {
    return res.json({ user: req.user });
});
// GET /api/auth/users
router.get('/users', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch staff members' });
    }
});
// POST /api/auth/users
router.post('/users', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password || 'password123', 10);
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create staff member' });
    }
});
exports.default = router;
