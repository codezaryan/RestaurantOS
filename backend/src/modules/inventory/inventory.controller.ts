import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { inventoryService } from "./inventory.service";
import {
  validateCreateIngredient,
  validateCreateStockMovement,
  validateCreateSupplier,
  validateCreatePurchaseOrder,
  validateCreateWarehouse,
  validateCreateCategory
} from "./inventory.validation";

// ==================== INGREDIENTS ====================
export const getIngredients = async (_req: AuthRequest, res: Response) => {
  try {
    const ingredients = await inventoryService.getIngredients();
    return res.json(ingredients);
  } catch {
    return res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

export const createIngredient = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateIngredient(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const ingredient = await inventoryService.createIngredient(req.body);
    return res.status(201).json(ingredient);
  } catch {
    return res.status(500).json({ error: "Failed to create ingredient" });
  }
};

export const updateIngredient = async (req: AuthRequest, res: Response) => {
  try {
    const ingredient = await inventoryService.updateIngredient(req.params.id, req.body);
    return res.json(ingredient);
  } catch {
    return res.status(500).json({ error: "Failed to update ingredient" });
  }
};

export const deleteIngredient = async (req: AuthRequest, res: Response) => {
  try {
    await inventoryService.deleteIngredient(req.params.id);
    return res.json({ message: "Ingredient deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete ingredient" });
  }
};

// ==================== STOCK MOVEMENTS ====================
export const createStockMovement = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateStockMovement(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const movement = await inventoryService.createStockMovement(req.body, req.user?.id);
    return res.status(201).json(movement);
  } catch (err: any) {
    if (err.status && err.error) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ error: "Failed to record stock movement" });
  }
};

export const getStockMovements = async (_req: AuthRequest, res: Response) => {
  try {
    const movements = await inventoryService.getStockMovements();
    return res.json(movements);
  } catch {
    return res.status(500).json({ error: "Failed to fetch stock movements" });
  }
};

// ==================== SUPPLIERS ====================
export const getSuppliers = async (_req: AuthRequest, res: Response) => {
  try {
    const suppliers = await inventoryService.getSuppliers();
    return res.json(suppliers);
  } catch {
    return res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateSupplier(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const supplier = await inventoryService.createSupplier(req.body);
    return res.status(201).json(supplier);
  } catch {
    return res.status(500).json({ error: "Failed to create supplier" });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await inventoryService.updateSupplier(req.params.id, req.body);
    return res.json(supplier);
  } catch {
    return res.status(500).json({ error: "Failed to update supplier" });
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response) => {
  try {
    await inventoryService.deleteSupplier(req.params.id);
    return res.json({ message: "Supplier deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete supplier" });
  }
};

// ==================== PURCHASE ORDERS ====================
export const getPurchaseOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await inventoryService.getPurchaseOrders();
    return res.json(orders);
  } catch {
    return res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreatePurchaseOrder(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const po = await inventoryService.createPurchaseOrder(req.body);
    return res.status(201).json(po);
  } catch {
    return res.status(500).json({ error: "Failed to create purchase order" });
  }
};

// ==================== WAREHOUSES ====================
export const getWarehouses = async (_req: AuthRequest, res: Response) => {
  try {
    const warehouses = await inventoryService.getWarehouses();
    return res.json(warehouses);
  } catch {
    return res.status(500).json({ error: "Failed to fetch warehouses" });
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateWarehouse(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const warehouse = await inventoryService.createWarehouse(req.body);
    return res.status(201).json(warehouse);
  } catch {
    return res.status(500).json({ error: "Failed to create warehouse" });
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const warehouse = await inventoryService.updateWarehouse(req.params.id, req.body);
    return res.json(warehouse);
  } catch {
    return res.status(500).json({ error: "Failed to update warehouse" });
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    await inventoryService.deleteWarehouse(req.params.id);
    return res.json({ message: "Warehouse deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete warehouse" });
  }
};

// ==================== CATEGORIES ====================
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const categories = await inventoryService.getCategories(type as string);
    return res.json(categories);
  } catch {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateCategory(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const category = await inventoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch {
    return res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await inventoryService.updateCategory(req.params.id, req.body);
    return res.json(category);
  } catch {
    return res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    await inventoryService.deleteCategory(req.params.id);
    return res.json({ message: "Category deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete category" });
  }
};
