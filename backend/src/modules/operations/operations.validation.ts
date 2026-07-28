import {
  CreateTableRequest,
  UpdateTableStatusRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest
} from "./operations.types";

export function validateCreateTable(data: CreateTableRequest): string | null {
  if (!data.tableNumber?.trim()) return "Table number is required.";
  if (!data.capacity || data.capacity < 1) return "Capacity must be at least 1.";
  return null;
}

export function validateUpdateTableStatus(data: UpdateTableStatusRequest): string | null {
  const validStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"];
  if (!data.status) return "Status is required.";
  if (!validStatuses.includes(data.status)) return `Status must be one of: ${validStatuses.join(", ")}`;
  return null;
}

export function validateCreateMenuItem(data: CreateMenuItemRequest): string | null {
  if (!data.name?.trim()) return "Name is required.";
  if (!data.price || data.price <= 0) return "Price must be greater than 0.";
  if (!data.categoryId?.trim()) return "Category ID is required.";
  return null;
}

export function validateUpdateMenuItem(data: UpdateMenuItemRequest): string | null {
  if (data.price !== undefined && data.price <= 0) return "Price must be greater than 0.";
  return null;
}

export function validateCreateOrder(data: CreateOrderRequest): string | null {
  if (!data.items?.length) return "At least one item is required.";
  for (const item of data.items) {
    if (!item.menuItemId?.trim()) return "Menu item ID is required for each item.";
    if (!item.quantity || item.quantity < 1) return "Quantity must be at least 1 for each item.";
  }
  return null;
}

export function validateUpdateOrderStatus(data: UpdateOrderStatusRequest): string | null {
  if (!data.status && !data.paymentStatus && !data.paymentMethod) return "At least one field to update is required.";
  return null;
}

