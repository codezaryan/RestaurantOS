import { Router } from "express";
import {
  authenticateToken,
  requireRoles
} from "../../middleware/auth";

import * as controller from "./expenses.controller";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CASHIER"),
  controller.getAll
);

router.post(
  "/",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.create
);

router.get(
  "/summary",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.summary
);

router.patch(
  "/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.update
);

router.delete(
  "/:id",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.remove
);

export default router;