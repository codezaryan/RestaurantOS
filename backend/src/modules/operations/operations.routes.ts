import { Router } from "express";
import {
  authenticateToken,
  requireRoles
} from "../../middleware/auth";

import * as controller from "./operations.controller";

const router = Router();

// ==================== TABLE ROUTES ====================

router.get(
  "/tables",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "WAITER", "CASHIER"),
  controller.getTables
);

router.post(
  "/tables",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.createTable
);

router.patch(
  "/tables/:id/status",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "WAITER"),
  controller.updateTableStatus
);

router.delete(
  "/tables/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteTable
);

// ==================== MENU ROUTES ====================

router.get(
  "/menu",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "WAITER", "CASHIER", "CHEF"),
  controller.getMenu
);

router.post(
  "/menu",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.createMenuItem
);

router.patch(
  "/menu/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.updateMenuItem
);

router.delete(
  "/menu/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteMenuItem
);

// ==================== ORDER ROUTES ====================

router.get(
  "/orders",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"),
  controller.getOrders
);

router.post(
  "/orders",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "WAITER"),
  controller.createOrder
);

router.patch(
  "/orders/:id/status",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "WAITER"),
  controller.updateOrderStatus
);

router.delete(
  "/orders/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.deleteOrder
);

export default router;
