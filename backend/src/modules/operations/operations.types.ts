export interface CreateTableRequest {
  tableNumber: string;
  capacity: number;
  section?: string;
}

export interface UpdateTableStatusRequest {
  status: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  prepTimeMinutes?: number;
  imageUrl?: string;
  recipes?: Array<{
    ingredientId: string;
    quantityRequired: number;
  }>;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  prepTimeMinutes?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  suggestedPrice?: number;
}

export interface CreateOrderRequest {
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}
