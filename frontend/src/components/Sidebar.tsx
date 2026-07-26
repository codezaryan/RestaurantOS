import React from 'react';
import { LayoutDashboard, UtensilsCrossed, Boxes, Receipt, Cpu, Users } from 'lucide-react';

export type NavTab = 'dashboard' | 'operations' | 'inventory' | 'expenses' | 'ai-studio' | 'staff';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  aiAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, aiAlertCount }) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'operations', label: 'Operations & KDS', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { tab: 'inventory', label: 'Inventory & Stock', icon: <Boxes className="w-5 h-5" /> },
    { tab: 'expenses', label: 'Expenses & AI Invoices', icon: <Receipt className="w-5 h-5" /> },
    { tab: 'ai-studio', label: 'AI Intelligence Studio', icon: <Cpu className="w-5 h-5 text-blue-400" />, badge: aiAlertCount },
    { tab: 'staff', label: 'Staff & Audit Logs', icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Platform Navigation</p>
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-blue-500 text-white shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Quick Status Widget */}
      <div className="glass-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-slate-200">Socket.io Live KDS Sync</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Real-time order tickets & stock push enabled</p>
      </div>
    </aside>
  );
};
