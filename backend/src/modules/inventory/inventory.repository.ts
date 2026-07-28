import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const inventoryRepository = {
  // Ingredients
  findAllIngredients() {
    return prisma.ingredient.findMany({
      include: { supplier: true, category: true },
      orderBy: { name: "asc" }
    });
  },

  createIngredient(data: any) {
    return prisma.ingredient.create({ data });
  },

  updateIngredient(id: string, data: any) {
    return prisma.ingredient.update({ where: { id }, data });
  },

  deleteIngredient(id: string) {
    return prisma.ingredient.delete({ where: { id } });
  },

  findIngredientById(id: string) {
    return prisma.ingredient.findUnique({ where: { id } });
  },

  // Stock Movements
  createStockMovement(data: any) {
    return prisma.stockMovement.create({
      data,
      include: { ingredient: true }
    });
  },

  findAllStockMovements() {
    return prisma.stockMovement.findMany({
      include: { ingredient: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  },

  // Suppliers
  findAllSuppliers() {
    return prisma.supplier.findMany({
      include: { ingredients: true, purchaseOrders: true },
      orderBy: { name: "asc" }
    });
  },

  createSupplier(data: any) {
    return prisma.supplier.create({ data });
  },

  updateSupplier(id: string, data: any) {
    return prisma.supplier.update({ where: { id }, data });
  },

  deleteSupplier(id: string) {
    return prisma.supplier.delete({ where: { id } });
  },

  // Purchase Orders
  findAllPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { ingredient: true } } },
      orderBy: { createdAt: "desc" }
    });
  },

  createPurchaseOrder(data: any) {
    return prisma.purchaseOrder.create({
      data,
      include: { supplier: true, items: { include: { ingredient: true } } }
    });
  },

  // Warehouses
  findAllWarehouses() {
    return prisma.warehouse.findMany({ orderBy: { name: "asc" } });
  },

  createWarehouse(data: any) {
    return prisma.warehouse.create({ data });
  },

  updateWarehouse(id: string, data: any) {
    return prisma.warehouse.update({ where: { id }, data });
  },

  deleteWarehouse(id: string) {
    return prisma.warehouse.delete({ where: { id } });
  },

  // Categories
  findAllCategories(where?: any) {
    return prisma.category.findMany({
      where,
      orderBy: { name: "asc" }
    });
  },

  createCategory(data: any) {
    return prisma.category.create({ data });
  },

  updateCategory(id: string, data: any) {
    return prisma.category.update({ where: { id }, data });
  },

  deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  // Audit
  createAuditLog(data: any) {
    return prisma.auditLog.create({ data });
  }
};
