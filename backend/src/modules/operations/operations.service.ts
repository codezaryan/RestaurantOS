import { operationsRepository } from "./operations.repository";
import {
  CreateTableRequest,
  UpdateTableStatusRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest
} from "./operations.types";

export const operationsService = {
  // ==================== TABLE MANAGEMENT ====================

  async getTables() {
    return operationsRepository.findAllTables();
  },

  async createTable(data: CreateTableRequest) {
    return operationsRepository.createTable({
      tableNumber: data.tableNumber,
      capacity: Number(data.capacity),
      section: data.section || "Main Dining",
      qrCode: `https://restaurantos.app/menu?table=${data.tableNumber}`
    });
  },

  async updateTableStatus(id: string, data: UpdateTableStatusRequest) {
    return operationsRepository.updateTableStatus(id, data.status);
  },

  async deleteTable(id: string) {
    return operationsRepository.deleteTable(id);
  },

  // ==================== MENU MANAGEMENT ====================

  async getMenuItems() {
    return operationsRepository.findAllMenuItems();
  },

  async createMenuItem(data: CreateMenuItemRequest) {
    const menuItemData: any = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      categoryId: data.categoryId,
      prepTimeMinutes: Number(data.prepTimeMinutes || 15),
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
    };

    if (data.recipes?.length) {
      menuItemData.recipes = {
        create: data.recipes.map((r: any) => ({
          ingredientId: r.ingredientId,
          quantityRequired: Number(r.quantityRequired)
        }))
      };
    }

    return operationsRepository.createMenuItem(menuItemData);
  },

  async updateMenuItem(id: string, data: UpdateMenuItemRequest) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.prepTimeMinutes !== undefined) updateData.prepTimeMinutes = Number(data.prepTimeMinutes);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.suggestedPrice !== undefined) updateData.suggestedPrice = Number(data.suggestedPrice);

    return operationsRepository.updateMenuItem(id, updateData);
  },

  async deleteMenuItem(id: string) {
    return operationsRepository.deleteMenuItem(id);
  },

  // ==================== ORDER MANAGEMENT ====================

  async getOrders(status?: string, limit?: number) {
    const where: any = {};
    if (status) where.status = status;
    return operationsRepository.findAllOrders(where, limit ? Number(limit) : 50);
  },

  async createOrder(data: CreateOrderRequest, userId?: string) {
    // Phase 1: Validate stock for all items
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const insufficientStock: string[] = [];

    for (const item of data.items) {
      const menuItem = await operationsRepository.findMenuItemById(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        notes: item.notes || ""
      });

      const recipes = await operationsRepository.findRecipesByMenuItemId(item.menuItemId);
      for (const recipe of recipes) {
        const ingredient = await operationsRepository.findIngredientById(recipe.ingredientId);
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

    if (insufficientStock.length > 0) {
      throw { status: 400, error: "Insufficient stock to fulfill order", details: insufficientStock };
    }

    // Phase 2: Deduct stock
    for (const item of data.items) {
      const menuItem = await operationsRepository.findMenuItemById(item.menuItemId);
      if (!menuItem) continue;

      const recipes = await operationsRepository.findRecipesByMenuItemId(item.menuItemId);
      for (const recipe of recipes) {
        const deductQty = recipe.quantityRequired * item.quantity;
        const ingredient = await operationsRepository.findIngredientById(recipe.ingredientId);
        if (ingredient) {
          await operationsRepository.updateIngredientStock(recipe.ingredientId, ingredient.currentStock - deductQty);
          await operationsRepository.createStockMovement({
            ingredientId: recipe.ingredientId,
            type: "OUT",
            quantity: deductQty,
            reason: `Order item sale: ${menuItem.name} x${item.quantity}`,
            userId
          });
        }
      }
    }

    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const orderNumber = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    const order = await operationsRepository.createOrder({
      orderNumber,
      tableId: data.tableId,
      waiterId: userId,
      status: "PENDING",
      subtotal,
      taxAmount,
      totalAmount,
      notes: data.notes,
      orderItems: { create: orderItemsData }
    });

    if (data.tableId) {
      await operationsRepository.updateTableStatus(data.tableId, "OCCUPIED");
    }

    await operationsRepository.createAuditLog({
      userId,
      action: "CREATE_ORDER",
      module: "RESTAURANT_OPERATIONS",
      details: `Created order #${orderNumber} for total $${totalAmount}`
    });

    return order;
  },

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;

    const order = await operationsRepository.updateOrder(id, updateData);

    if ((order.status === "COMPLETED" || order.status === "SERVED") && order.paymentStatus === "PAID") {
      if (order.tableId) {
        await operationsRepository.updateTableStatus(order.tableId, "CLEANING");
      }
    }

    return order;
  },

  async deleteOrder(id: string) {
    return operationsRepository.deleteOrder(id);
  }
};
