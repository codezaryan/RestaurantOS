"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/expenses
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            include: { category: true, supplier: true, invoice: true },
            orderBy: { date: 'desc' }
        });
        return res.json(expenses);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});
// POST /api/expenses
router.post('/', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create expense record' });
    }
});
// GET /api/expenses/summary
router.get('/summary', auth_1.authenticateToken, async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            include: { category: true }
        });
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categoryBreakdown = {};
        for (const e of expenses) {
            const catName = e.category?.name || 'General Operations';
            categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + e.amount;
        }
        return res.json({
            totalExpense: Number(totalExpense.toFixed(2)),
            count: expenses.length,
            categoryBreakdown
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to generate expense summary' });
    }
});
exports.default = router;
