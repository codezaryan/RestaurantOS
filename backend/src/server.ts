import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import operationsRoutes from './routes/operations';
import inventoryRoutes from './routes/inventory';
import expensesRoutes from './routes/expenses';
import aiRoutes from './routes/ai';
import invoicesRoutes from './routes/invoices';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static directory for uploaded invoice files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Attach Socket.io to express app for routes access
app.set('io', io);

// Socket.io Real-time Connection
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/invoices', invoicesRoutes);

// Health check — includes database connectivity status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'disconnected';
    dbError = err?.message || 'Unknown database error';
  }

  res.json({
    status: dbStatus === 'connected' ? 'online' : 'degraded',
    platform: 'RestaurantOS – AI Powered Restaurant Management Platform',
    version: '1.0.0',
    database: {
      status: dbStatus,
      ...(dbError && { error: dbError })
    },
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, async () => {
  console.log(`🚀 RestaurantOS Server running on http://localhost:${PORT}`);

  // Test database connection at startup and log result
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully');
  } catch (err: any) {
    console.error('❌ Database connection FAILED:', err?.message || err);
    console.error('   Check your DATABASE_URL environment variable.');
    console.error('   If using Render, ensure you copy the INTERNAL database URL (not external).');
  }
});

export default app;
