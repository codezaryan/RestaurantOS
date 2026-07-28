import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth";
import * as controller from "./inventory.controller";

const router = Router();

// ==================== INGREDIENTS ====================
router.get(
  "/ingredients",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "STORE_MANAGER"),
  controller.getIngredients
);

router.post(
  "/ingredients",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.createIngredient
);

router.patch(
  "/ingredients/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.updateIngredient
);

router.delete(
  "/ingredients/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteIngredient
);

// ==================== STOCK MOVEMENTS ====================
router.post(
  "/stock-movement",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "STORE_MANAGER"),
  controller.createStockMovement
);

router.get(
  "/movements",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "STORE_MANAGER"),
  controller.getStockMovements
);

// ==================== SUPPLIERS ====================
router.get(
  "/suppliers",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.getSuppliers
);

router.post(
  "/suppliers",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.createSupplier
);

router.patch(
  "/suppliers/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.updateSupplier
);

router.delete(
  "/suppliers/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteSupplier
);

// ==================== PURCHASE ORDERS ====================
router.get(
  "/purchase-orders",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.getPurchaseOrders
);

router.post(
  "/purchase-orders",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.createPurchaseOrder
);

// ==================== WAREHOUSES ====================
router.get(
  "/warehouses",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.getWarehouses
);

router.post(
  "/warehouses",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.createWarehouse
);

router.patch(
  "/warehouses/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.updateWarehouse
);

router.delete(
  "/warehouses/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteWarehouse
);

// ==================== CATEGORIES ====================
router.get(
  "/categories",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.getCategories
);

router.post(
  "/categories",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.createCategory
);

router.patch(
  "/categories/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.updateCategory
);

router.delete(
  "/categories/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteCategory
);

export default router;
