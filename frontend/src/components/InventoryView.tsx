import React, { useState } from 'react';
import { Ingredient, Supplier } from '../types';
import { Boxes, Plus, AlertCircle, ArrowUpRight, ArrowDownRight, Trash2, ShoppingCart, Truck } from 'lucide-react';

interface InventoryViewProps {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onRecordStockMovement: (data: { ingredientId: string; type: string; quantity: number; reason?: string }) => void;
  onCreatePurchaseOrder: (supplierId: string, items: { ingredientId: string; quantity: number; unitCost: number }[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  ingredients,
  suppliers,
  onRecordStockMovement,
  onCreatePurchaseOrder
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'po' | 'suppliers'>('stock');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'WASTE'>('IN');
  const [movementQty, setMovementQty] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('Standard inventory delivery');

  const handleMovementSubmit = () => {
    if (!selectedIngredient || movementQty <= 0) return;
    onRecordStockMovement({
      ingredientId: selectedIngredient.id,
      type: movementType,
      quantity: movementQty,
      reason: movementReason
    });
    setSelectedIngredient(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white">Inventory & Warehouse Management</h1>
          <p className="text-xs text-slate-400">Track raw ingredient stock levels, record stock movements, and manage purchase orders.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('stock')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'stock' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ingredient Stock ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveSubTab('po')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'po' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Purchase Orders
          </button>
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'suppliers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Suppliers Directory ({suppliers.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INGREDIENT STOCK */}
      {activeSubTab === 'stock' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Ingredient Name</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Min Threshold</th>
                  <th className="p-4">Unit Cost</th>
                  <th className="p-4">Primary Supplier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {ingredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minStockLevel;
                  return (
                    <tr key={ing.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        {isLow && <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />}
                        {ing.name}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                          isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {ing.currentStock} {ing.unit}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{ing.minStockLevel} {ing.unit}</td>
                      <td className="p-4 text-emerald-400 font-semibold">${ing.costPerUnit.toFixed(2)} / {ing.unit}</td>
                      <td className="p-4 text-slate-400">{ing.supplier?.name || 'Nile Hospitality Logistics'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedIngredient(ing)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                        >
                          Stock In / Out
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stock Movement Modal */}
          {selectedIngredient && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Record Movement: {selectedIngredient.name}</h3>
                  <button onClick={() => setSelectedIngredient(null)} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Movement Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setMovementType('IN')}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                          movementType === 'IN' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Stock In
                      </button>
                      <button
                        onClick={() => setMovementType('OUT')}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                          movementType === 'OUT' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" /> Stock Out
                      </button>
                      <button
                        onClick={() => setMovementType('WASTE')}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                          movementType === 'WASTE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Waste
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Quantity ({selectedIngredient.unit})</label>
                    <input
                      type="number"
                      value={movementQty}
                      onChange={(e) => setMovementQty(Number(e.target.value))}
                      className="w-full glass-input p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Notes / Reason</label>
                    <input
                      type="text"
                      value={movementReason}
                      onChange={(e) => setMovementReason(e.target.value)}
                      className="w-full glass-input p-2.5 rounded-xl text-xs"
                      placeholder="e.g. Supplier delivery or spoilage"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setSelectedIngredient(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cancel</button>
                  <button onClick={handleMovementSubmit} className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white">Save Movement</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: SUPPLIERS DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">{s.name}</h3>
              <p className="text-xs text-slate-400">Contact: {s.contactPerson || 'Account Executive'}</p>
              <p className="text-xs text-blue-400 font-medium">{s.email}</p>
              <p className="text-xs text-slate-400">{s.phone}</p>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">{s.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
