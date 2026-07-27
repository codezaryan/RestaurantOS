import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/expenses
router.get('/', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CASHIER'), async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { category: true, supplier: true, invoice: true },
      orderBy: { date: 'desc' }
    });
    return res.json(expenses);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses
router.post('/', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, categoryId, supplierId, date, notes } = req.body;
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        categoryId,
        supplierId,
        date: date ? new Date(date) : new Date(),
        notes
      },
      include: { category: true, supplier: true }
    });
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create expense record' });
  }
});

// GET /api/expenses/summary
router.get('/summary', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { category: true }
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    for (const e of expenses) {
      const catName = e.category?.name || 'General Operations';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + e.amount;
    }

    return res.json({
      totalExpense: Number(totalExpense.toFixed(2)),
      count: expenses.length,
      categoryBreakdown
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate expense summary' });
  }
});

export default router;
