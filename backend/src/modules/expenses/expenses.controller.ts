import { Request, Response } from "express";
import { expensesService } from "./expenses.service";
import { validateCreateExpense } from "./expenses.validation";

export const getAll = async (_req: Request, res: Response) => {

  try {
    const expenses = await expensesService.getAll();
    return res.json(expenses);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch expenses"
    });
  }

};

export const create = async (req: Request, res: Response) => {

  const validationError = validateCreateExpense(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  try {

    const expense = await expensesService.create(req.body);

    return res.status(201).json(expense);

  } catch {

    return res.status(500).json({
      error: "Failed to create expense record"
    });

  }

};

export const summary = async (_req: Request, res: Response) => {

  try {

    const summary = await expensesService.getSummary();

    return res.json(summary);

  } catch {

    return res.status(500).json({
      error: "Failed to generate expense summary"
    });

  }

};

export const update = async (req: Request, res: Response) => {
  try {
    const expense = await expensesService.update(req.params.id, req.body);
    return res.json(expense);
  } catch {
    return res.status(500).json({ error: "Failed to update expense" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await expensesService.delete(req.params.id);
    return res.json({ message: "Expense deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete expense" });
  }
};