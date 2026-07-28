export function validateCreateIngredient(data: any): string | null {
  if (!data.name?.trim()) return "Name is required.";
  if (!data.unit?.trim()) return "Unit is required.";
  return null;
}

export function validateCreateStockMovement(data: any): string | null {
  if (!data.ingredientId?.trim()) return "Ingredient ID is required.";
  if (!data.type) return "Type (IN, OUT, WASTE, ADJUSTMENT) is required.";
  if (!data.quantity || data.quantity <= 0) return "Quantity must be greater than 0.";
  return null;
}

export function validateCreateSupplier(data: any): string | null {
  if (!data.name?.trim()) return "Supplier name is required.";
  return null;
}

export function validateCreatePurchaseOrder(data: any): string | null {
  if (!data.supplierId?.trim()) return "Supplier ID is required.";
  if (!data.items?.length) return "At least one item is required.";
  for (const item of data.items) {
    if (!item.ingredientId?.trim()) return "Ingredient ID is required for each item.";
    if (!item.quantity || item.quantity <= 0) return "Quantity must be greater than 0.";
    if (!item.unitCost || item.unitCost <= 0) return "Unit cost must be greater than 0.";
  }
  return null;
}

export function validateCreateWarehouse(data: any): string | null {
  if (!data.name?.trim()) return "Warehouse name is required.";
  return null;
}

export function validateCreateCategory(data: any): string | null {
  if (!data.name?.trim()) return "Category name is required.";
  return null;
}
