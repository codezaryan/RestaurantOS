import { CreateExpenseRequest } from "./expenses.types";

export function validateCreateExpense(data: CreateExpenseRequest): string | null {
  if (!data.title?.trim()) {
    return "Title is required.";
  }

  if (data.amount === undefined || data.amount === null || Number(data.amount) <= 0) {
    return "Amount must be greater than 0.";
  }

  return null;
}