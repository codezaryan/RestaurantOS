import axios from 'axios';
import { 
  User, Table, MenuItem, Ingredient, Order, Supplier, Expense, Invoice,
  AIShortagePrediction, AIReorderRecommendation, AIPricingSuggestion, AIPrepTimeEstimate, AIWasteAnalysis 
} from './types';

// API base URL: Use VITE_API_URL env var (set on Render), fall back to /api proxy for local dev
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const savedToken = localStorage.getItem('restaurant_os_token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const api = {
  // Auth
  login: async (email: string, password: string, requestedRole?: string) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password, requestedRole });
    if (res.data?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      localStorage.setItem('restaurant_os_token', res.data.token);
    }
    return res.data;
  },
  logout: () => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('restaurant_os_token');
    localStorage.removeItem('restaurant_os_user');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('restaurant_os_token');
  },
  getStaff: async () => {
    const res = await axios.get<User[]>(`${API_BASE}/auth/users`);
    return res.data;
  },
  createStaff: async (data: any) => {
    const res = await axios.post(`${API_BASE}/auth/users`, data);
    return res.data;
  },

  // Operations
  getTables: async () => {
    const res = await axios.get<Table[]>(`${API_BASE}/operations/tables`);
    return res.data;
  },
  updateTableStatus: async (id: string, status: string) => {
    const res = await axios.patch(`${API_BASE}/operations/tables/${id}/status`, { status });
    return res.data;
  },
  getMenu: async () => {
    const res = await axios.get<MenuItem[]>(`${API_BASE}/operations/menu`);
    return res.data;
  },
  createMenuItem: async (data: any) => {
    const res = await axios.post(`${API_BASE}/operations/menu`, data);
    return res.data;
  },
  getOrders: async (status?: string) => {
    const res = await axios.get<Order[]>(`${API_BASE}/operations/orders`, { params: { status } });
    return res.data;
  },
  createOrder: async (data: any) => {
    const res = await axios.post(`${API_BASE}/operations/orders`, data);
    return res.data;
  },
  updateOrderStatus: async (id: string, status: string, paymentStatus?: string, paymentMethod?: string) => {
    const res = await axios.patch(`${API_BASE}/operations/orders/${id}/status`, { status, paymentStatus, paymentMethod });
    return res.data;
  },

  // Inventory
  getIngredients: async () => {
    const res = await axios.get<Ingredient[]>(`${API_BASE}/inventory/ingredients`);
    return res.data;
  },
  createIngredient: async (data: any) => {
    const res = await axios.post(`${API_BASE}/inventory/ingredients`, data);
    return res.data;
  },
  recordStockMovement: async (data: { ingredientId: string; type: string; quantity: number; reason?: string }) => {
    const res = await axios.post(`${API_BASE}/inventory/stock-movement`, data);
    return res.data;
  },
  getSuppliers: async () => {
    const res = await axios.get<Supplier[]>(`${API_BASE}/inventory/suppliers`);
    return res.data;
  },
  getStockMovements: async () => {
    const res = await axios.get(`${API_BASE}/inventory/movements`);
    return res.data;
  },
  getPurchaseOrders: async () => {
    const res = await axios.get(`${API_BASE}/inventory/purchase-orders`);
    return res.data;
  },
  createPurchaseOrder: async (data: any) => {
    const res = await axios.post(`${API_BASE}/inventory/purchase-orders`, data);
    return res.data;
  },

  // Expenses & Invoices
  getExpenses: async () => {
    const res = await axios.get<Expense[]>(`${API_BASE}/expenses`);
    return res.data;
  },
  getExpenseSummary: async () => {
    const res = await axios.get(`${API_BASE}/expenses/summary`);
    return res.data;
  },
  getInvoices: async () => {
    const res = await axios.get<Invoice[]>(`${API_BASE}/invoices`);
    return res.data;
  },
  uploadInvoice: async (formData: FormData) => {
    const res = await axios.post(`${API_BASE}/invoices/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  exportExpenseRegisterExcelUrl: () => `${API_BASE}/invoices/export-excel`,

  // AI Features
  getAIShortagePredictions: async () => {
    const res = await axios.get<AIShortagePrediction[]>(`${API_BASE}/ai/predict-shortages`);
    return res.data;
  },
  getAIReorderRecommendations: async () => {
    const res = await axios.get<AIReorderRecommendation[]>(`${API_BASE}/ai/recommend-reorder`);
    return res.data;
  },
  getAIPricingSuggestions: async () => {
    const res = await axios.get<AIPricingSuggestion[]>(`${API_BASE}/ai/suggest-pricing`);
    return res.data;
  },
  estimatePrepTime: async (itemIds: string[]) => {
    const res = await axios.post<AIPrepTimeEstimate>(`${API_BASE}/ai/estimate-prep-time`, { itemIds });
    return res.data;
  },
  getAIWasteAnalysis: async () => {
    const res = await axios.get<AIWasteAnalysis>(`${API_BASE}/ai/analyze-waste`);
    return res.data;
  }
};
