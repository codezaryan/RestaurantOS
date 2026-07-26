export type Role = 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER' | 'CASHIER' | 'STORE_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  qrCode?: string;
  section?: string;
  orders?: Order[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  suggestedPrice?: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId: string;
  category?: { name: string };
  recipes?: Recipe[];
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  reorderQuantity: number;
  costPerUnit: number;
  supplierId?: string;
  supplier?: Supplier;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  ingredientId: string;
  quantityRequired: number;
  ingredient?: Ingredient;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  table?: Table;
  waiterId?: string;
  waiter?: User;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId?: string;
  category?: { name: string };
  supplierId?: string;
  supplier?: Supplier;
  date: string;
  paymentStatus: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId?: string;
  supplier?: Supplier;
  uploadPath: string;
  fileType: string;
  invoiceDate?: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  ocrRawText?: string;
  extractionConfidence: number;
  status: 'PROCESSED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  items?: InvoiceItem[];
}

export interface AIShortagePrediction {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  dailyConsumptionRate: number;
  daysRemaining: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
  recommendedReorderDate: string;
}

export interface AIReorderRecommendation {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
  supplierName: string;
  reason: string;
}

export interface AIPricingSuggestion {
  menuItemId: string;
  menuItemName: string;
  currentPrice: number;
  calculatedCostPrice: number;
  currentMarginPercent: number;
  suggestedPrice: number;
  suggestedMarginPercent: number;
  recommendation: string;
}

export interface AIPrepTimeEstimate {
  itemsCount: number;
  activeKitchenOrders: number;
  estimatedPrepTimeMinutes: number;
  congestionFactor: number;
  status: 'FAST' | 'NORMAL' | 'BUSY' | 'SLOWER_THAN_USUAL';
}

export interface AIWasteAnalysis {
  totalWasteCost: number;
  periodDays: number;
  topWastedIngredients: Array<{
    name: string;
    totalQuantity: number;
    unit: string;
    totalCost: number;
    primaryReason: string;
  }>;
  recommendations: string[];
}
