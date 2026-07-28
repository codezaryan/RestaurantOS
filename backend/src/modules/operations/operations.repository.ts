import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const operationsRepository = {
  // Tables
  findAllTables() {
    return prisma.table.findMany({
      include: {
        orders: {
          where: { status: { in: ["PENDING", "PREPARING", "READY", "SERVED"] } },
          include: { orderItems: { include: { menuItem: true } } }
        }
      },
      orderBy: { tableNumber: "asc" }
    });
  },

  createTable(data: any) {
    return prisma.table.create({ data });
  },

  updateTableStatus(id: string, status: string) {
    return prisma.table.update({
      where: { id },
      data: { status }
    });
  },

  deleteTable(id: string) {
    return prisma.table.delete({ where: { id } });
  },

  // Menu Items
  findAllMenuItems() {
    return prisma.menuItem.findMany({
      include: {
        category: true,
        recipes: { include: { ingredient: true } }
      },
      orderBy: { name: "asc" }
    });
  },

  createMenuItem(data: any) {
    return prisma.menuItem.create({
      data,
      include: { recipes: { include: { ingredient: true } } }
    });
  },

  updateMenuItem(id: string, data: any) {
    return prisma.menuItem.update({
      where: { id },
      data
    });
  },

  deleteMenuItem(id: string) {
    return prisma.menuItem.delete({ where: { id } });
  },

  findMenuItemById(id: string) {
    return prisma.menuItem.findUnique({ where: { id } });
  },

  // Orders
  findAllOrders(where?: any, limit?: number) {
    return prisma.order.findMany({
      where,
      include: {
        table: true,
        waiter: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit || 50
    });
  },

  createOrder(data: any) {
    return prisma.order.create({
      data,
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    });
  },

  updateOrder(id: string, data: any) {
    return prisma.order.update({
      where: { id },
      data,
      include: { table: true, orderItems: { include: { menuItem: true } } }
    });
  },

  deleteOrder(id: string) {
    return prisma.order.delete({ where: { id } });
  },

  // Recipes
  findRecipesByMenuItemId(menuItemId: string) {
    return prisma.recipe.findMany({ where: { menuItemId } });
  },

  // Ingredients
  findIngredientById(id: string) {
    return prisma.ingredient.findUnique({ where: { id } });
  },

  updateIngredientStock(id: string, currentStock: number) {
    return prisma.ingredient.update({
      where: { id },
      data: { currentStock }
    });
  },

  createStockMovement(data: any) {
    return prisma.stockMovement.create({ data });
  },

  // Audit
  createAuditLog(data: any) {
    return prisma.auditLog.create({ data });
  }
};
