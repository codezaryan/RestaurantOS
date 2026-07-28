export interface CreateIngredientRequest {
  name: string;
  unit: string;
  currentStock?: number;
  minStockLevel?: number;
  reorderQuantity?: number;
  costPerUnit?: number;
  supplierId?: string;
  categoryId?: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  unit?: string;
  currentStock?: number;
  minStockLevel?: number;
  reorderQuantity?: number;
  costPerUnit?: number;
  supplierId?: string;
  categoryId?: string;
}

export interface CreateStockMovementRequest {
  ingredientId: string;
  type: "IN" | "OUT" | "WASTE" | "ADJUSTMENT";
  quantity: number;
  reason?: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  items: Array<{
    ingredientId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface CreateWarehouseRequest {
  name: string;
  location?: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  type?: string;
}
