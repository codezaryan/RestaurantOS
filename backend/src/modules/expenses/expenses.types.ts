export interface CreateExpenseRequest {
  title: string;
  amount: number;
  categoryId?: string;
  supplierId?: string;
  date?: string;
  notes?: string;
}