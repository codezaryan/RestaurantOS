"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ==================== INGREDIENTS & STOCK ====================
// GET /api/inventory/ingredients
router.get('/ingredients', auth_1.authenticateToken, async (req, res) => {
    try {
        const ingredients = await prisma.ingredient.findMany({
            include: { supplier: true, category: true },
            orderBy: { name: 'asc' }
        });
        return res.json(ingredients);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});
// POST /api/inventory/ingredients
router.post('/ingredients', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, unit, currentStock, minStockLevel, reorderQuantity, costPerUnit, supplierId, categoryId } = req.body;
        const ingredient = await prisma.ingredient.create({
            data: {
                name,
                unit,
                currentStock: Number(currentStock || 0),
                minStockLevel: Number(minStockLevel || 10),
                reorderQuantity: Number(reorderQuantity || 50),
                costPerUnit: Number(costPerUnit || 0),
                supplierId,
                categoryId
            }
        });
        return res.status(201).json(ingredient);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create ingredient' });
    }
});
// POST /api/inventory/stock-movement (Stock In / Stock Out / Waste)
router.post('/stock-movement', auth_1.authenticateToken, async (req, res) => {
    try {
        const { ingredientId, type, quantity, reason } = req.body;
        const qty = Number(quantity);
        const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
        if (!ingredient)
            return res.status(404).json({ error: 'Ingredient not found' });
        let newStock = ingredient.currentStock;
        if (type === 'IN')
            newStock += qty;
        else
            newStock = Math.max(0, newStock - qty);
        await prisma.ingredient.update({
            where: { id: ingredientId },
            data: { currentStock: newStock }
        });
        const movement = await prisma.stockMovement.create({
            data: {
                ingredientId,
                type: type || 'IN',
                quantity: qty,
                reason,
                userId: req.user?.id
            },
            include: { ingredient: true }
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                userName: req.user?.name,
                action: `STOCK_${type}`,
                module: 'INVENTORY_MANAGEMENT',
                details: `${type} movement of ${qty} ${ingredient.unit} for ${ingredient.name}`
            }
        });
        return res.status(201).json(movement);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to record stock movement' });
    }
});
// GET /api/inventory/movements
router.get('/movements', auth_1.authenticateToken, async (req, res) => {
    try {
        const movements = await prisma.stockMovement.findMany({
            include: { ingredient: true, user: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return res.json(movements);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch stock movements' });
    }
});
// ==================== PURCHASE ORDERS & SUPPLIERS ====================
// GET /api/inventory/suppliers
router.get('/suppliers', auth_1.authenticateToken, async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            include: { ingredients: true, purchaseOrders: true },
            orderBy: { name: 'asc' }
        });
        return res.json(suppliers);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});
// POST /api/inventory/suppliers
router.post('/suppliers', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;
        const supplier = await prisma.supplier.create({
            data: { name, contactPerson, email, phone, address }
        });
        return res.status(201).json(supplier);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create supplier' });
    }
});
// GET /api/inventory/purchase-orders
router.get('/purchase-orders', auth_1.authenticateToken, async (req, res) => {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: { supplier: true, items: { include: { ingredient: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(pos);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
});
// POST /api/inventory/purchase-orders
router.post('/purchase-orders', auth_1.authenticateToken, async (req, res) => {
    try {
        const { supplierId, items } = req.body;
        let totalAmount = 0;
        const poItemsData = [];
        for (const item of items) {
            const totalCost = item.quantity * item.unitCost;
            totalAmount += totalCost;
            poItemsData.push({
                ingredientId: item.ingredientId,
                quantity: Number(item.quantity),
                unitCost: Number(item.unitCost),
                totalCost: Number(totalCost.toFixed(2))
            });
        }
        const poNumber = 'PO-2026-' + Math.floor(1000 + Math.random() * 9000);
        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId,
                status: 'ORDERED',
                totalAmount,
                expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                items: { create: poItemsData }
            },
            include: { supplier: true, items: { include: { ingredient: true } } }
        });
        return res.status(201).json(po);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create purchase order' });
    }
});
exports.default = router;
