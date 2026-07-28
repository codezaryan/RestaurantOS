import { expensesRepository } from "./expenses.repository";
import { CreateExpenseRequest } from "./expenses.types";

export const expensesService = {

  async getAll() {
    return expensesRepository.findAll();
  },

  async create(data: CreateExpenseRequest) {

    return expensesRepository.create({
      title: data.title,
      amount: Number(data.amount),
      categoryId: data.categoryId,
      supplierId: data.supplierId,
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes
    });

  },

  async getSummary() {

    const expenses = await expensesRepository.findForSummary();

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const categoryBreakdown: Record<string, number> = {};

    for (const expense of expenses) {

      const category = expense.category?.name ?? "General Operations";

      categoryBreakdown[category] =
        (categoryBreakdown[category] || 0) + expense.amount;

    }

    return {
      totalExpense: Number(totalExpense.toFixed(2)),
      count: expenses.length,
      categoryBreakdown
    };

  }

};