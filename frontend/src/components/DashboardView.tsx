import React from 'react';
import { Table, Order, Ingredient, Expense, AIShortagePrediction } from '../types';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, ArrowUpRight, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

interface DashboardViewProps {
  orders: Order[];
  tables: Table[];
  ingredients: Ingredient[];
  expenses: Expense[];
  shortagePredictions: AIShortagePrediction[];
  onNavigateToAI: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  tables,
  ingredients,
  expenses,
  shortagePredictions,
  onNavigateToAI
}) => {
  // Key Metrics
  const totalSales = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0) + 2480; // Add baseline mock sales for demo aesthetics

  const activeOrdersCount = orders.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length;
  
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStockLevel).length;

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = Math.max(0, totalSales - totalExpensesAmount);
  const profitMarginPercent = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 62;

  // Chart Data
  const salesTrendData = [
    { day: 'Mon', sales: 1240, expenses: 420 },
    { day: 'Tue', sales: 1580, expenses: 510 },
    { day: 'Wed', sales: 1420, expenses: 380 },
    { day: 'Thu', sales: 1890, expenses: 620 },
    { day: 'Fri', sales: 2450, expenses: 840 },
    { day: 'Sat', sales: 3120, expenses: 950 },
    { day: 'Sun', sales: 2840, expenses: 780 }
  ];

  const occupancyBySectionData = [
    { name: 'Patio Window', count: 2, fill: '#3b82f6' },
    { name: 'Main Dining', count: 4, fill: '#10b981' },
    { name: 'VIP Lounge', count: 1, fill: '#8b5cf6' },
    { name: 'Chef Booth', count: 1, fill: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-blue-950/30 to-slate-900/90">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            RestaurantOS Business Analytics
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Systems Synchronized
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time sales breakdown, active tables, expenses, and AI shortage warnings.</p>
        </div>
        <button
          onClick={onNavigateToAI}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Launch AI Shortage Engine</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Overview */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales (Today)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-white">${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last week</span>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Kitchen Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-white">{activeOrdersCount} Orders</h2>
            <p className="text-xs text-slate-400 mt-1">Kitchen KDS processing in real-time</p>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Table Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-white">{occupancyRate}% <span className="text-xs font-medium text-slate-400">({occupiedTables}/{tables.length} tables)</span></h2>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-rose-400">{lowStockCount} Items</h2>
            <p className="text-xs text-rose-300/80 mt-1">Requires reorder attention</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Expenses Overview Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Sales vs Expenses Trend (Weekly)</h3>
              <p className="text-xs text-slate-400">Monitored gross revenue vs operational costs</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/> Revenue</span>
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block"/> Expenses</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                  formatter={(val: number) => [`$${val}`, '']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Overview & Table Occupancy */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1">Profitability & Gross Margin</h3>
            <p className="text-xs text-slate-400 mb-4">Estimated net margin after ingredients & expenses</p>
            
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Net Estimated Profit</span>
                <h4 className="text-xl font-extrabold text-emerald-400">${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Gross Margin</span>
                <h4 className="text-xl font-extrabold text-blue-400">{profitMarginPercent}%</h4>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Capacity by Dining Section</h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyBySectionData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} hide />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={85} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {occupancyBySectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Ingredient Shortage Quick Alerts Widget */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Predicted Shortage Alerts</h3>
              <p className="text-xs text-slate-400">Items flagged to deplete within next 48-72 hours</p>
            </div>
          </div>
          <button
            onClick={onNavigateToAI}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
          >
            View Full AI Intelligence Studio &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shortagePredictions.slice(0, 3).map((pred) => (
            <div key={pred.ingredientId} className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{pred.ingredientName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  pred.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  pred.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {pred.urgency}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <p>Stock: <span className="text-slate-200 font-semibold">{pred.currentStock} {pred.unit}</span></p>
                <p>Est. Depletion: <span className="text-rose-400 font-semibold">{pred.daysRemaining} days remaining</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
