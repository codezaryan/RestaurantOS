import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, UserPlus, FileText, Check } from 'lucide-react';

interface StaffViewProps {
  staff: User[];
  onAddStaff: (data: { name: string; email: string; role: Role; phone?: string }) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staff, onAddStaff }) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<Role>('WAITER');
  const [phone, setPhone] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onAddStaff({ name, email, role, phone });
    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  const rbacMatrix: Array<{ module: string; owner: boolean; manager: boolean; chef: boolean; waiter: boolean; cashier: boolean; store: boolean }> = [
    { module: 'Executive Financial Dashboard', owner: true, manager: true, chef: false, waiter: false, cashier: false, store: false },
    { module: 'Table & Floor Plan Control', owner: true, manager: true, chef: false, waiter: true, cashier: true, store: false },
    { module: 'Kitchen Display System (KDS)', owner: true, manager: true, chef: true, waiter: true, cashier: false, store: false },
    { module: 'Ingredient & Warehouse Stock', owner: true, manager: true, chef: true, waiter: false, cashier: false, store: true },
    { module: 'Purchase Orders & Suppliers', owner: true, manager: true, chef: false, waiter: false, cashier: false, store: true },
    { module: 'AI Invoice Processing & OCR', owner: true, manager: true, chef: false, waiter: false, cashier: false, store: true },
    { module: 'Excel Expense Register Export', owner: true, manager: true, chef: false, waiter: false, cashier: false, store: false },
    { module: 'AI Shortage & Pricing Engine', owner: true, manager: true, chef: true, waiter: false, cashier: false, store: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white">Staff Management & Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-slate-400">Manage restaurant personnel across Owner, Manager, Chef, Waiter, Cashier, and Store Manager roles.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Staff Roster */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {staff.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white">{user.name}</td>
                <td className="p-4 text-slate-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                    user.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                    user.role === 'CHEF' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    user.role === 'WAITER' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    user.role === 'CASHIER' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{user.phone || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RBAC Privileges Matrix */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" /> System RBAC Permissions Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="p-3 text-left">Module / Capability</th>
                <th className="p-3 text-purple-400">Owner</th>
                <th className="p-3 text-blue-400">Manager</th>
                <th className="p-3 text-amber-400">Chef</th>
                <th className="p-3 text-emerald-400">Waiter</th>
                <th className="p-3 text-rose-400">Cashier</th>
                <th className="p-3 text-cyan-400">Store Mgr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="p-3 text-left font-semibold text-white">{row.module}</td>
                  <td className="p-3">{row.owner ? <Check className="w-4 h-4 text-purple-400 mx-auto" /> : '-'}</td>
                  <td className="p-3">{row.manager ? <Check className="w-4 h-4 text-blue-400 mx-auto" /> : '-'}</td>
                  <td className="p-3">{row.chef ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> : '-'}</td>
                  <td className="p-3">{row.waiter ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : '-'}</td>
                  <td className="p-3">{row.cashier ? <Check className="w-4 h-4 text-rose-400 mx-auto" /> : '-'}</td>
                  <td className="p-3">{row.store ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Staff Member</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full glass-input p-2.5 rounded-xl" placeholder="John Doe" />
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full glass-input p-2.5 rounded-xl" placeholder="john@restaurantos.io" />
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full glass-input p-2.5 rounded-xl bg-slate-900 text-white">
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CHEF">Chef</option>
                  <option value="WAITER">Waiter</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1">Phone Number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full glass-input p-2.5 rounded-xl" placeholder="+1-555-0100" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white">Create Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
