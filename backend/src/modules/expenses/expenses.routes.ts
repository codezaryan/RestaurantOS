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

export default router;