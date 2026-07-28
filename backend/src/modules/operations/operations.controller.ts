import { Request, Response } from "express";
import { operationsService } from "./operations.service";
import {
  validateCreateTable,
  validateUpdateTableStatus,
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateCreateOrder,
  validateUpdateOrderStatus
} from "./operations.validation";
import { AuthRequest } from "../../middleware/auth";

// ==================== TABLE MANAGEMENT ====================

export const getTables = async (_req: AuthRequest, res: Response) => {
  try {
    const tables = await operationsService.getTables();
    return res.json(tables);
  } catch {
    return res.status(500).json({ error: "Failed to fetch tables" });
  }
};

export const createTable = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateTable(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const table = await operationsService.createTable(req.body);
    return res.status(201).json(table);
  } catch {
    return res.status(500).json({ error: "Failed to create table" });
  }
};

export const updateTableStatus = async (req: AuthRequest, res: Response) => {
  const validationError = validateUpdateTableStatus(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const table = await operationsService.updateTableStatus(req.params.id, req.body);
    return res.json(table);
  } catch {
    return res.status(500).json({ error: "Failed to update table status" });
  }
};

export const deleteTable = async (req: AuthRequest, res: Response) => {
  try {
    await operationsService.deleteTable(req.params.id);
    return res.json({ message: "Table deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete table" });
  }
};

// ==================== MENU MANAGEMENT ====================

export const getMenu = async (_req: AuthRequest, res: Response) => {
  try {
    const menuItems = await operationsService.getMenuItems();
    return res.json(menuItems);
  } catch {
    return res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

export const createMenuItem = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateMenuItem(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const menuItem = await operationsService.createMenuItem(req.body);
    return res.status(201).json(menuItem);
  } catch {
    return res.status(500).json({ error: "Failed to create menu item" });
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response) => {
  const validationError = validateUpdateMenuItem(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const menuItem = await operationsService.updateMenuItem(req.params.id, req.body);
    return res.json(menuItem);
  } catch {
    return res.status(500).json({ error: "Failed to update menu item" });
  }
};

export const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    await operationsService.deleteMenuItem(req.params.id);
    return res.json({ message: "Menu item deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete menu item" });
  }
};

// ==================== ORDER MANAGEMENT ====================

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit } = req.query;
    const orders = await operationsService.getOrders(status as string, limit ? Number(limit) : undefined);
    return res.json(orders);
  } catch {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateOrder(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const order = await operationsService.createOrder(req.body, req.user?.id);

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("new_order", order);
    }

    return res.status(201).json(order);
  } catch (err: any) {
    if (err.status && err.error) {
      return res.status(err.status).json({ error: err.error, details: err.details });
    }
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const validationError = validateUpdateOrderStatus(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const order = await operationsService.updateOrderStatus(req.params.id, req.body);

    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", order);
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ error: "Failed to update order status" });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    await operationsService.deleteOrder(req.params.id);
    return res.json({ message: "Order deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete order" });
  }
};
