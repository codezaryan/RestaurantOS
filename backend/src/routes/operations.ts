import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ==================== TABLE MANAGEMENT ====================

// GET /api/operations/tables
router.get('/tables', authenticateToken, requireRoles('OWNER', 'MANAGER', 'WAITER', 'CASHIER'), async (req: AuthRequest, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] } },
          include: { orderItems: { include: { menuItem: true } } }
        }
      },
      orderBy: { tableNumber: 'asc' }
    });
    return res.json(tables);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// POST /api/operations/tables
router.post('/tables', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { tableNumber, capacity, section } = req.body;
    const table = await prisma.table.create({
      data: {
        tableNumber,
        capacity: Number(capacity),
        section: section || 'Main Dining',
        qrCode: `https://restaurantos.app/menu?table=${tableNumber}`
      }
    });
    return res.status(201).json(table);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create table' });
  }
});

// PATCH /api/operations/tables/:id/status
router.patch('/tables/:id/status', authenticateToken, requireRoles('OWNER', 'MANAGER', 'WAITER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const table = await prisma.table.update({
      where: { id },
      data: { status }
    });
    return res.json(table);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update table status' });
  }
});

// ==================== MENU & RECIPE MANAGEMENT ====================

// GET /api/operations/menu
router.get('/menu', authenticateToken, requireRoles('OWNER', 'MANAGER', 'WAITER', 'CASHIER', 'CHEF'), async (req: AuthRequest, res: Response) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        recipes: { include: { ingredient: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(menuItems);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/operations/menu
router.post('/menu', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, categoryId, prepTimeMinutes, imageUrl, recipes } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        categoryId,
        prepTimeMinutes: Number(prepTimeMinutes || 15),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
        recipes: recipes ? {
          create: recipes.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantityRequired: Number(r.quantityRequired)
          }))
        } : undefined
      },
      include: { recipes: { include: { ingredient: true } } }
    });
    return res.status(201).json(menuItem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PATCH /api/operations/menu/:id
router.patch('/menu/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, prepTimeMinutes, imageUrl, isAvailable, suggestedPrice } = req.body;
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes: Number(prepTimeMinutes) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(suggestedPrice !== undefined && { suggestedPrice: Number(suggestedPrice) })
      }
    });
    return res.json(menuItem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/operations/menu/:id
router.delete('/menu/:id', authenticateToken, requireRoles('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    return res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ==================== ORDER & KITCHEN (KDS) MANAGEMENT ====================

// GET /api/operations/orders
router.get('/orders', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'WAITER', 'CASHIER'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit } = req.query;
    const where: any = {};
    if (status) {
      where.status = status as string;
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        waiter: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : 50
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/operations/orders
router.post('/orders', authenticateToken, requireRoles('OWNER', 'MANAGER', 'WAITER'), async (req: AuthRequest, res: Response) => {
  try {
    const { tableId, items, notes } = req.body;

    let subtotal = 0;
    const orderItemsData = [];
    const insufficientStock: string[] = [];

    // Phase 1: Validate stock availability for all items
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        notes: item.notes || ''
      });

      // Check stock for each ingredient recipe
      const recipes = await prisma.recipe.findMany({ where: { menuItemId: item.menuItemId } });
      for (const recipe of recipes) {
        const ingredient = await prisma.ingredient.findUnique({ where: { id: recipe.ingredientId } });
        if (ingredient) {
          const requiredQty = recipe.quantityRequired * item.quantity;
          if (ingredient.currentStock < requiredQty) {
            insufficientStock.push(
              `${menuItem.name}: insufficient ${ingredient.name} (have ${ingredient.currentStock} ${ingredient.unit}, need ${requiredQty} ${ingredient.unit})`
            );
          }
        }
      }
    }

    // If any stock insufficient, reject the order
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock to fulfill order',
        details: insufficientStock
      });
    }

    // Phase 2: Deduct stock (only if all items are valid)
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) continue;

      const recipes = await prisma.recipe.findMany({ where: { menuItemId: item.menuItemId } });
      for (const recipe of recipes) {
        const deductQty = recipe.quantityRequired * item.quantity;
        await prisma.ingredient.update({
          where: { id: recipe.ingredientId },
          data: { currentStock: { decrement: deductQty } }
        });
        await prisma.stockMovement.create({
          data: {
            ingredientId: recipe.ingredientId,
            type: 'OUT',
            quantity: deductQty,
            reason: `Order item sale: ${menuItem.name} x${item.quantity}`,
            userId: req.user?.id
          }
        });
      }
    }

    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId,
        waiterId: req.user?.id,
        status: 'PENDING',
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        orderItems: { create: orderItemsData }
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    });

    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name,
        action: 'CREATE_ORDER',
        module: 'RESTAURANT_OPERATIONS',
        details: `Created order #${orderNumber} for total $${totalAmount}`
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', order);
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/operations/orders/:id/status
router.patch('/orders/:id/status', authenticateToken, requireRoles('OWNER', 'MANAGER', 'CHEF', 'WAITER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { table: true, orderItems: { include: { menuItem: true } } }
    });

    if (order.status === 'COMPLETED' || order.status === 'SERVED') {
      if (order.tableId && order.paymentStatus === 'PAID') {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'CLEANING' }
        });
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', order);
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
