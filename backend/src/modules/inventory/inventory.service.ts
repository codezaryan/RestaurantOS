import { inventoryRepository } from "./inventory.repository";

export const inventoryService = {
  // ==================== INGREDIENTS ====================
  async getIngredients() {
    return inventoryRepository.findAllIngredients();
  },

  async createIngredient(data: any) {
    return inventoryRepository.createIngredient({
      name: data.name,
      unit: data.unit,
      currentStock: Number(data.currentStock || 0),
      minStockLevel: Number(data.minStockLevel || 10),
      reorderQuantity: Number(data.reorderQuantity || 50),
      costPerUnit: Number(data.costPerUnit || 0),
      supplierId: data.supplierId,
      categoryId: data.categoryId
    });
  },

  async updateIngredient(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.currentStock !== undefined) updateData.currentStock = Number(data.currentStock);
    if (data.minStockLevel !== undefined) updateData.minStockLevel = Number(data.minStockLevel);
    if (data.reorderQuantity !== undefined) updateData.reorderQuantity = Number(data.reorderQuantity);
    if (data.costPerUnit !== undefined) updateData.costPerUnit = Number(data.costPerUnit);
    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    return inventoryRepository.updateIngredient(id, updateData);
  },

  async deleteIngredient(id: string) {
    return inventoryRepository.deleteIngredient(id);
  },

  // ==================== STOCK MOVEMENTS ====================
  async createStockMovement(data: any, userId?: string) {
    const ingredient = await inventoryRepository.findIngredientById(data.ingredientId);
    if (!ingredient) {
      throw { status: 404, error: "Ingredient not found" };
    }

    const qty = Number(data.quantity);
    let newStock = ingredient.currentStock;
    if (data.type === "IN") newStock += qty;
    else newStock = Math.max(0, newStock - qty);

    await inventoryRepository.updateIngredient(data.ingredientId, { currentStock: newStock });

    const movement = await inventoryRepository.createStockMovement({
      ingredientId: data.ingredientId,
      type: data.type || "IN",
      quantity: qty,
      reason: data.reason,
      userId
    });

    await inventoryRepository.createAuditLog({
      userId,
      action: `STOCK_${data.type}`,
      module: "INVENTORY_MANAGEMENT",
      details: `${data.type} movement of ${qty} ${ingredient.unit} for ${ingredient.name}`
    });

    return movement;
  },

  async getStockMovements() {
    return inventoryRepository.findAllStockMovements();
  },

  // ==================== SUPPLIERS ====================
  async getSuppliers() {
    return inventoryRepository.findAllSuppliers();
  },

  async createSupplier(data: any) {
    return inventoryRepository.createSupplier(data);
  },

  async updateSupplier(id: string, data: any) {
    return inventoryRepository.updateSupplier(id, data);
  },

  async deleteSupplier(id: string) {
    return inventoryRepository.deleteSupplier(id);
  },

  // ==================== PURCHASE ORDERS ====================
  async getPurchaseOrders() {
    return inventoryRepository.findAllPurchaseOrders();
  },

  async createPurchaseOrder(data: any) {
    let totalAmount = 0;
    const poItemsData = [];

    for (const item of data.items) {
      const totalCost = item.quantity * item.unitCost;
      totalAmount += totalCost;
      poItemsData.push({
        ingredientId: item.ingredientId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        totalCost: Number(totalCost.toFixed(2))
      });
    }

    const poNumber = "PO-2026-" + Math.floor(1000 + Math.random() * 9000);

    return inventoryRepository.createPurchaseOrder({
      poNumber,
      supplierId: data.supplierId,
      status: "ORDERED",
      totalAmount,
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: { create: poItemsData }
    });
  },

  // ==================== WAREHOUSES ====================
  async getWarehouses() {
    return inventoryRepository.findAllWarehouses();
  },

  async createWarehouse(data: any) {
    return inventoryRepository.createWarehouse(data);
  },

  async updateWarehouse(id: string, data: any) {
    return inventoryRepository.updateWarehouse(id, data);
  },

  async deleteWarehouse(id: string) {
    return inventoryRepository.deleteWarehouse(id);
  },

  // ==================== CATEGORIES ====================
  async getCategories(type?: string) {
    const where: any = {};
    if (type) where.type = type;
    return inventoryRepository.findAllCategories(where);
  },

  async createCategory(data: any) {
    return inventoryRepository.createCategory({
      name: data.name,
      description: data.description,
      type: data.type || "MENU"
    });
  },

  async updateCategory(id: string, data: any) {
    return inventoryRepository.updateCategory(id, data);
  },

  async deleteCategory(id: string) {
    return inventoryRepository.deleteCategory(id);
  }
};
