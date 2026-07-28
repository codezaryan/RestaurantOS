import { Router } from "express";

import {
  authenticateToken,
  requireRoles,
} from "../../middleware/auth";

import * as controller from "./ai.controller";

const router = Router();

router.get(
  "/predict-shortages",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF", "STORE_MANAGER"),
  controller.predictShortages
);

router.get(
  "/recommend-reorder",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
  controller.recommendReorder
);

router.get(
  "/suggest-pricing",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.suggestPricing
);

router.post(
  "/estimate-prep-time",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF"),
  controller.estimatePrepTime
);

router.get(
  "/analyze-waste",
  authenticateToken,
  requireRoles("OWNER", "MANAGER", "CHEF"),
  controller.analyzeWaste
);

export default router;