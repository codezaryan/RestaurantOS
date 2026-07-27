import React, { useState, useEffect } from 'react';
import { 
  Role, Table, Order, MenuItem, Ingredient, Supplier, Expense, Invoice,
  AIShortagePrediction, AIReorderRecommendation, AIPricingSuggestion, AIWasteAnalysis, User 
} from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OperationsView } from './components/OperationsView';
import { InventoryView } from './components/InventoryView';
import { ExpensesInvoicesView } from './components/ExpensesInvoicesView';
import { AIStudioView } from './components/AIStudioView';
import { StaffView } from './components/StaffView';
import { LoginScreen } from './components/LoginScreen';
import { io } from 'socket.io-client';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(api.isAuthenticated());
  const [currentRole, setCurrentRole] = useState<Role>('OWNER');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // State Data
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<User[]>([]);

  // AI Data
  const [shortagePredictions, setShortagePredictions] = useState<AIShortagePrediction[]>([]);
  const [reorderRecommendations, setReorderRecommendations] = useState<AIReorderRecommendation[]>([]);
  const [pricingSuggestions, setPricingSuggestions] = useState<AIPricingSuggestion[]>([]);
  const [wasteAnalysis, setWasteAnalysis] = useState<AIWasteAnalysis | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Initial Fetch & Real-time setup
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        tablesData,
        ordersData,
        menuData,
        ingData,
        supData,
        expData,
        invData,
        staffData,
        shortagesData,
        reorderData,
        pricingData,
        wasteData
      ] = await Promise.all([
        api.getTables(),
        api.getOrders(),
        api.getMenu(),
        api.getIngredients(),
        api.getSuppliers(),
        api.getExpenses(),
        api.getInvoices(),
        api.getStaff(),
        api.getAIShortagePredictions(),
        api.getAIReorderRecommendations(),
        api.getAIPricingSuggestions(),
        api.getAIWasteAnalysis()
      ]);

      setTables(tablesData);
      setOrders(ordersData);
      setMenuItems(menuData);
      setIngredients(ingData);
      setSuppliers(supData);
      setExpenses(expData);
      setInvoices(invData);
      setStaff(staffData);

      setShortagePredictions(shortagesData);
      setReorderRecommendations(reorderData);
      setPricingSuggestions(pricingData);
      setWasteAnalysis(wasteData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    loadAllData();

    // Socket.io Listener
    const socketUrl = import.meta.env.VITE_WS_URL || undefined;
    const socket = io(socketUrl);
    socket.on('new_order', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
    });
    socket.on('order_status_updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentRole('OWNER');
  };

  const handleRoleChange = async (newRole: Role) => {
    setCurrentRole(newRole);
    // Role switching no longer re-logins — uses existing token
  };

  // Handler functions
  const handleUpdateTableStatus = async (id: string, status: string) => {
    await api.updateTableStatus(id, status);
    const updated = await api.getTables();
    setTables(updated);
  };

  const handleUpdateOrderStatus = async (id: string, status: string, paymentStatus?: string) => {
    await api.updateOrderStatus(id, status, paymentStatus);
    const updated = await api.getOrders();
    setOrders(updated);
  };

  const handleCreateOrder = async (tableId: string, items: { menuItemId: string; quantity: number }[]) => {
    await api.createOrder({ tableId, items });
    const updatedOrders = await api.getOrders();
    const updatedTables = await api.getTables();
    setOrders(updatedOrders);
    setTables(updatedTables);
  };

  const handleRecordStockMovement = async (data: { ingredientId: string; type: string; quantity: number; reason?: string }) => {
    await api.recordStockMovement(data);
    const updatedIng = await api.getIngredients();
    setIngredients(updatedIng);
  };

  const handleUploadInvoice = async (formData: FormData) => {
    await api.uploadInvoice(formData);
    const updatedInvoices = await api.getInvoices();
    const updatedExpenses = await api.getExpenses();
    setInvoices(updatedInvoices);
    setExpenses(updatedExpenses);
  };

  const handleAddStaff = async (data: { name: string; email: string; role: Role; phone?: string }) => {
    await api.createStaff(data);
    const updatedStaff = await api.getStaff();
    setStaff(updatedStaff);
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar currentRole={currentRole} onRoleChange={handleRoleChange} onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          aiAlertCount={shortagePredictions.filter(p => p.urgency === 'CRITICAL' || p.urgency === 'HIGH').length}
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400">Loading RestaurantOS AI Platform Data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  orders={orders}
                  tables={tables}
                  ingredients={ingredients}
                  expenses={expenses}
                  shortagePredictions={shortagePredictions}
                  onNavigateToAI={() => setActiveTab('ai-studio')}
                />
              )}

              {activeTab === 'operations' && (
                <OperationsView
                  tables={tables}
                  orders={orders}
                  menuItems={menuItems}
                  currentRole={currentRole}
                  onUpdateTableStatus={handleUpdateTableStatus}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onCreateOrder={handleCreateOrder}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  ingredients={ingredients}
                  suppliers={suppliers}
                  onRecordStockMovement={handleRecordStockMovement}
                  onCreatePurchaseOrder={async () => {}}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesInvoicesView
                  expenses={expenses}
                  invoices={invoices}
                  onUploadInvoice={handleUploadInvoice}
                />
              )}

              {activeTab === 'ai-studio' && (
                <AIStudioView
                  shortagePredictions={shortagePredictions}
                  reorderRecommendations={reorderRecommendations}
                  pricingSuggestions={pricingSuggestions}
                  wasteAnalysis={wasteAnalysis}
                />
              )}

              {activeTab === 'staff' && (
                <StaffView
                  staff={staff}
                  onAddStaff={handleAddStaff}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
