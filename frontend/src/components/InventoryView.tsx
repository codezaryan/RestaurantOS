import React, { useState, useEffect } from 'react';
import { Ingredient, Supplier } from '../types';
import { Boxes, Plus, AlertCircle, ArrowUpRight, ArrowDownRight, Trash2, ShoppingCart, Truck, ClipboardList, FileText } from 'lucide-react';
import { api } from '../api';

interface InventoryViewProps {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onRecordStockMovement: (data: { ingredientId: string; type: string; quantity: number; reason?: string }) => void;
  onCreatePurchaseOrder: (supplierId: string, items: { ingredientId: string; quantity: number; unitCost: number }[]) => void;
  onCreateIngredient?: (data: any) => Promise<void>;
  onDeleteIngredient?: (id: string) => Promise<void>;
  onCreateSupplier?: (data: any) => Promise<void>;
  onDeleteSupplier?: (id: string) => Promise<void>;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: string;
  totalAmount: number;
  orderDate: string;
  expectedDelivery?: string;
  items: Array<{
    id: string;
    ingredientId: string;
    ingredient?: Ingredient;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

interface StockMovement {
  id: string;
  ingredientId: string;
  ingredient?: Ingredient;
  type: string;
  quantity: number;
  reason?: string;
  user?: { name: string };
  createdAt: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  ingredients,
  suppliers,
  onRecordStockMovement,
  onCreatePurchaseOrder
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'po' | 'suppliers' | 'movements'>('stock');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'WASTE'>('IN');
  const [movementQty, setMovementQty] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('Standard inventory delivery');

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [showPOCreateModal, setShowPOCreateModal] = useState(false);
  const [poSupplier, setPoSupplier] = useState('');
  const [poItems, setPoItems] = useState<{ ingredientId: string; quantity: number; unitCost: number }[]>([]);
  const [loadingPO, setLoadingPO] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'po') {
      loadPurchaseOrders();
    }
    if (activeSubTab === 'movements') {
      loadStockMovements();
    }
  }, [activeSubTab]);

  const loadPurchaseOrders = async () => {
    setLoadingPO(true);
    try {
      const pos = await api.getPurchaseOrders();
      setPurchaseOrders(pos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPO(false);
    }
  };

  const loadStockMovements = async () => {
    setLoadingMovements(true);
    try {
      const movements = await api.getStockMovements();
      setStockMovements(movements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMovements(false);
    }
  };

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

  const handleAddPOItem = (ingredientId: string) => {
    const ing = ingredients.find(i => i.id === ingredientId);
    if (!ing) return;
    setPoItems([...poItems, { ingredientId, quantity: ing.reorderQuantity, unitCost: ing.costPerUnit }]);
  };

  const handleCreatePO = async () => {
    if (!poSupplier || poItems.length === 0) return;
    try {
      await api.createPurchaseOrder({ supplierId: poSupplier, items: poItems });
      setShowPOCreateModal(false);
      setPoItems([]);
      setPoSupplier('');
      loadPurchaseOrders();
    } catch (err) {
      console.error(err);
    }
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
            onClick={() => setActiveSubTab('movements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'movements' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Movements
          </button>
          <button
            onClick={() => setActiveSubTab('po')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'po' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'suppliers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Suppliers ({suppliers.length})
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

      {/* SUBTAB 2: STOCK MOVEMENTS HISTORY */}
      {activeSubTab === 'movements' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/90 p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-400" />
              Stock Movement History (Last 50)
            </h3>
          </div>
          {loadingMovements ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading movements...</div>
          ) : stockMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No stock movements recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Date/Time</th>
                  <th className="p-4">Ingredient</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="p-4 text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold text-white">{m.ingredient?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        m.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' :
                        m.type === 'OUT' ? 'bg-blue-500/20 text-blue-400' :
                        m.type === 'WASTE' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>{m.type}</span>
                    </td>
                    <td className="p-4 font-semibold">{m.quantity}</td>
                    <td className="p-4 text-slate-400">{m.reason || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{m.user?.name || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SUBTAB 3: PURCHASE ORDERS */}
      {activeSubTab === 'po' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPOCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Create Purchase Order
            </button>
          </div>

          {loadingPO ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading purchase orders...</div>
          ) : purchaseOrders.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-2xl border border-slate-800">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No purchase orders yet</p>
              <p className="text-xs text-slate-500 mt-1">Create your first purchase order to track supplier deliveries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="glass-card p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <span className="font-bold text-white text-sm">{po.poNumber}</span>
                        <span className="text-xs text-slate-400 ml-2">{po.supplier?.name || 'Unknown Supplier'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                        po.status === 'ORDERED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        po.status === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        po.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{po.status}</span>
                      <span className="font-black text-emerald-400">${po.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Ordered: {new Date(po.orderDate).toLocaleDateString()} | Expected: {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'N/A'}
                  </div>
                  {po.items && po.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      {po.items.map((item) => (
                        <div key={item.id} className="flex justify-between py-0.5">
                          <span>{item.ingredient?.name || 'Unknown'} x{item.quantity}</span>
                          <span className="text-slate-300">${item.totalCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create PO Modal */}
          {showPOCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-slate-700 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Create Purchase Order</h3>
                  <button onClick={() => { setShowPOCreateModal(false); setPoItems([]); }} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Supplier</label>
                  <select
                    value={poSupplier}
                    onChange={(e) => setPoSupplier(e.target.value)}
                    className="w-full glass-input p-2.5 rounded-xl text-xs bg-slate-900 text-white"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Add Items (click ingredient to add)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {ingredients.map(ing => (
                      <button
                        key={ing.id}
                        onClick={() => handleAddPOItem(ing.id)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold"
                      >
                        + {ing.name}
                      </button>
                    ))}
                  </div>
                </div>

                {poItems.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-300">Order Items:</p>
                    {poItems.map((item, idx) => {
                      const ing = ingredients.find(i => i.id === item.ingredientId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300">{ing?.name}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...poItems];
                                newItems[idx].quantity = Number(e.target.value);
                                setPoItems(newItems);
                              }}
                              className="w-16 glass-input p-1 rounded-lg text-xs text-center"
                            />
                            <span className="text-slate-400">x ${item.unitCost.toFixed(2)}</span>
                            <button
                              onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                      <span className="text-white">Total Est.</span>
                      <span className="text-emerald-400">${poItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => { setShowPOCreateModal(false); setPoItems([]); }} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cancel</button>
                  <button onClick={handleCreatePO} className="px-5 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white">Create Purchase Order</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: SUPPLIERS DIRECTORY */}
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

