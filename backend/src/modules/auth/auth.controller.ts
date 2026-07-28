import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { authService } from "./auth.service";
import { validateLogin, validateCreateUser } from "./auth.validation";

export const login = async (req: Request, res: Response) => {
  const error = validateLogin(req.body.email, req.body.password);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch {
    return res.status(401).json({ error: "Invalid email or password." });
  }
};

export const me = (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
};

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await authService.getUsers();
    return res.json(users);
  } catch {
    return res.status(500).json({ error: "Failed to fetch staff members" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const validationError = validateCreateUser(req.body.password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const user = await authService.createUser(req.body, req.user);
    return res.status(201).json(user);
  } catch {
    return res.status(500).json({ error: "Failed to create staff member" });
  }
};

export const seedDatabase = async (_req: Request, res: Response) => {
  try {
    const result = await authService.seedDatabase();
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message === "ALREADY_SEEDED") {
      return res.status(400).json({ error: "Database is already seeded" });
    }
    return res.status(500).json({
      error: "Failed to seed database",
      detail: err?.message || String(err)
    });
  }
};
