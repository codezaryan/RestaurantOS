import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ==================== TABLE MANAGEMENT ====================

// GET /api/operations/tables
router.get('/tables', authenticateToken, async (req: AuthRequest, res: Response) => {
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
router.post('/tables', authenticateToken, async (req: AuthRequest, res: Response) => {
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
router.patch('/tables/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
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
router.get('/menu', authenticateToken, async (req: AuthRequest, res: Response) => {
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
router.post('/menu', authenticateToken, async (req: AuthRequest, res: Response) => {
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

// ==================== ORDER & KITCHEN (KDS) MANAGEMENT ====================

// GET /api/operations/orders
router.get('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
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
router.post('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { tableId, items, notes } = req.body;

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (menuItem) {
        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        orderItemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          notes: item.notes || ''
        });

        // Automatically deduct recipe ingredients from stock
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
router.patch('/orders/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
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
