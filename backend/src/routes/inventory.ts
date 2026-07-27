import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ==================== INGREDIENTS & STOCK ====================

// GET /api/inventory/ingredients
router.get('/ingredients', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: { supplier: true, category: true },
      orderBy: { name: 'asc' }
    });
    return res.json(ingredients);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// POST /api/inventory/ingredients
router.post('/ingredients', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PATCH /api/inventory/ingredients/:id
router.patch('/ingredients/:id', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, currentStock, minStockLevel, reorderQuantity, costPerUnit, supplierId, categoryId } = req.body;
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
        ...(minStockLevel !== undefined && { minStockLevel: Number(minStockLevel) }),
        ...(reorderQuantity !== undefined && { reorderQuantity: Number(reorderQuantity) }),
        ...(costPerUnit !== undefined && { costPerUnit: Number(costPerUnit) }),
        ...(supplierId !== undefined && { supplierId }),
        ...(categoryId !== undefined && { categoryId })
      }
    });
    return res.json(ingredient);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// DELETE /api/inventory/ingredients/:id
router.delete('/ingredients/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.ingredient.delete({ where: { id } });
    return res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// POST /api/inventory/stock-movement (Stock In / Stock Out / Waste)
router.post('/stock-movement', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { ingredientId, type, quantity, reason } = req.body;
    const qty = Number(quantity);

    const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
    if (!ingredient) return res.status(404).json({ error: 'Ingredient not found' });

    let newStock = ingredient.currentStock;
    if (type === 'IN') newStock += qty;
    else newStock = Math.max(0, newStock - qty);

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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record stock movement' });
  }
});

// GET /api/inventory/movements
router.get('/movements', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { ingredient: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json(movements);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// ==================== PURCHASE ORDERS & SUPPLIERS ====================

// GET /api/inventory/suppliers
router.get('/suppliers', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { ingredients: true, purchaseOrders: true },
      orderBy: { name: 'asc' }
    });
    return res.json(suppliers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// POST /api/inventory/suppliers
router.post('/suppliers', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, email, phone, address }
    });
    return res.status(201).json(supplier);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PATCH /api/inventory/suppliers/:id
router.patch('/suppliers/:id', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, contactPerson, email, phone, address }
    });
    return res.json(supplier);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE /api/inventory/suppliers/:id
router.delete('/suppliers/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({ where: { id } });
    return res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// GET /api/inventory/purchase-orders
router.get('/purchase-orders', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { ingredient: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(pos);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// POST /api/inventory/purchase-orders
router.post('/purchase-orders', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// ==================== WAREHOUSE / STORE MANAGEMENT ====================

// GET /api/inventory/warehouses
router.get('/warehouses', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(warehouses);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// POST /api/inventory/warehouses
router.post('/warehouses', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, description } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, location, description }
    });
    return res.status(201).json(warehouse);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// PATCH /api/inventory/warehouses/:id
router.patch('/warehouses/:id', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { name, location, description }
    });
    return res.json(warehouse);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// DELETE /api/inventory/warehouses/:id
router.delete('/warehouses/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.warehouse.delete({ where: { id } });
    return res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

// ==================== CATEGORIES (Menu, Inventory, Expense) ====================

// GET /api/inventory/categories
router.get('/categories', authenticateToken, requireRoles('OWNER', 'MANAGER', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const where: any = {};
    if (type) where.type = type as string;
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/inventory/categories
router.post('/categories', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, type } = req.body;
    const category = await prisma.category.create({
      data: { name, description, type: type || 'MENU' }
    });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// PATCH /api/inventory/categories/:id
router.patch('/categories/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, description, type }
    });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/inventory/categories/:id
router.delete('/categories/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
