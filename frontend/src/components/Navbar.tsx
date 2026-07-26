import React from 'react';
import { Role } from '../types';
import { Shield, Sparkles, ChefHat, UserCheck, Utensils, DollarSign, Store, Activity } from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const roles: { role: Role; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'OWNER', label: 'Owner', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { role: 'MANAGER', label: 'Manager', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { role: 'CHEF', label: 'Chef', icon: <ChefHat className="w-3.5 h-3.5" />, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { role: 'WAITER', label: 'Waiter', icon: <Utensils className="w-3.5 h-3.5" />, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { role: 'CASHIER', label: 'Cashier', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { role: 'STORE_MANAGER', label: 'Store Mgr', icon: <Store className="w-3.5 h-3.5" />, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Restaurant<span className="text-blue-400">OS</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
              AI Enterprise
            </span>
          </div>
          <p className="text-[11px] text-slate-400">AI-Powered Hospitality & Restaurant Management</p>
        </div>
      </div>

      {/* Evaluator Quick Role Switcher */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 animate-ping" />
          Active RBAC Role:
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {roles.map((r) => {
            const isActive = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => onRoleChange(r.role)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? `${r.color} shadow-md scale-105 border-opacity-100`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
