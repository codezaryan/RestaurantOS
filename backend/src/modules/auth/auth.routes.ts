import { Router } from "express";

import * as controller from "./auth.controller";
import { authenticateToken, requireRoles } from "../../middleware/auth";

const router = Router();

router.post("/login", controller.login);

router.get("/me", authenticateToken, controller.me);

router.get(
  "/users",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.getUsers
);

router.post(
  "/users",
  authenticateToken,
  requireRoles("OWNER", "MANAGER"),
  controller.createUser
);

router.post("/seed", controller.seedDatabase);

export default router;
