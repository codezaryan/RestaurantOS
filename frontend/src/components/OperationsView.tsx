import React, { useState } from "react";
import { Table, Order, MenuItem, Role } from "../types";
import {
  Utensils,
  Clock,
  CheckCircle2,
  QrCode,
  Plus,
  ChevronRight,
  Flame,
} from "lucide-react";

interface OperationsViewProps {
  tables: Table[];
  orders: Order[];
  menuItems: MenuItem[];
  currentRole: Role;
  onUpdateTableStatus: (id: string, status: string) => void;
  onUpdateOrderStatus: (
    id: string,
    status: string,
    paymentStatus?: string,
  ) => void;
  onCreateOrder: (
    tableId: string,
    items: { menuItemId: string; quantity: number }[],
  ) => void;
  onCreateTable?: (data: {
    tableNumber: string;
    capacity: number;
    section?: string;
  }) => Promise<void>;
  onDeleteTable?: (id: string) => Promise<void>;
  onCreateMenuItem?: (data: {
    name: string;
    price: number;
    categoryId: string;
    description?: string;
  }) => Promise<void>;
  onDeleteMenuItem?: (id: string) => Promise<void>;
  onDeleteOrder?: (id: string) => Promise<void>;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  tables,
  orders,
  menuItems,
  currentRole,
  onUpdateTableStatus,
  onUpdateOrderStatus,
  onCreateOrder,
  onCreateTable,
  onDeleteTable,
  onCreateMenuItem,
  onDeleteMenuItem,
  onDeleteOrder,
}) => {
  const [subTab, setSubTab] = useState<"tables" | "kds" | "menu">("tables");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [newOrderItems, setNewOrderItems] = useState<
    { menuItemId: string; quantity: number }[]
  >([]);

  // Modals state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [tableCapacity, setTableCapacity] = useState("4");
  const [tableSection, setTableSection] = useState("Main Dining");

  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("15.00");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuCategoryId, setMenuCategoryId] = useState("");

  // KDS Columns
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");
  const servedOrders = orders.filter(
    (o) => o.status === "SERVED" || o.status === "COMPLETED",
  );

  const addItemToOrder = (menuItemId: string) => {
    const existing = newOrderItems.find((i) => i.menuItemId === menuItemId);
    if (existing) {
      setNewOrderItems(
        newOrderItems.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setNewOrderItems([...newOrderItems, { menuItemId, quantity: 1 }]);
    }
  };

  const handleCreateOrderSubmit = () => {
    if (!selectedTable || newOrderItems.length === 0) return;
    onCreateOrder(selectedTable.id, newOrderItems);
    setNewOrderItems([]);
    setSelectedTable(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            Restaurant Operations & Kitchen Display (KDS)
          </h1>
          <p className="text-xs text-slate-400">
            Floor table management, live kitchen preparation board, and recipe
            menu catalog.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab("tables")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "tables"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Table Management ({tables.length})
          </button>
          <button
            onClick={() => setSubTab("kds")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "kds"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Kitchen Display System (
            {pendingOrders.length + preparingOrders.length})
          </button>
          <button
            onClick={() => setSubTab("menu")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "menu"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Menu & Recipes ({menuItems.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: TABLES */}
      {subTab === "tables" && (
        <div className="space-y-4">
          {(currentRole === "OWNER" || currentRole === "MANAGER") && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddTableModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dining Table</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((t) => {
              const activeOrder = t.orders?.[0];
              const isOccupied = t.status === "OCCUPIED";
              const isReserved = t.status === "RESERVED";
              const isCleaning = t.status === "CLEANING";

              return (
                <div
                  key={t.id}
                  className={`glass-card p-5 rounded-2xl border transition-all duration-200 relative ${
                    isOccupied
                      ? "border-amber-500/50 bg-amber-950/10"
                      : isReserved
                        ? "border-purple-500/50 bg-purple-950/10"
                        : isCleaning
                          ? "border-blue-500/50 bg-blue-950/10"
                          : "border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-white">
                      {t.tableNumber}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          isOccupied
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : isReserved
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : isCleaning
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                      {onDeleteTable &&
                        (currentRole === "OWNER" ||
                          currentRole === "MANAGER") && (
                          <button
                            onClick={() => onDeleteTable(t.id)}
                            className="text-slate-500 hover:text-rose-400 text-xs font-bold px-1"
                            title="Delete Table"
                          >
                            &times;
                          </button>
                        )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {t.section} &bull; Capacity {t.capacity} guests
                  </p>

                  {activeOrder && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>Order #{activeOrder.orderNumber}</span>
                        <span className="text-amber-400">
                          ${activeOrder.totalAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {activeOrder.orderItems
                          .map((i) => `${i.quantity}x ${i.menuItem?.name}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          onUpdateTableStatus(
                            t.id,
                            t.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE",
                          )
                        }
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        Toggle Status
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedTable(t)}
                      className="px-3 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Take Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Order Modal */}
          {selectedTable && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    Create New Order for Table {selectedTable.tableNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItemToOrder(item.id)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-emerald-400">
                          ${item.price}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-400" />
                    </button>
                  ))}
                </div>

                {newOrderItems.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <p className="text-xs font-bold text-slate-300">
                      Selected Items:
                    </p>
                    {newOrderItems.map((i) => {
                      const m = menuItems.find((x) => x.id === i.menuItemId);
                      return (
                        <div
                          key={i.menuItemId}
                          className="flex justify-between text-xs text-slate-400"
                        >
                          <span>
                            {i.quantity}x {m?.name}
                          </span>
                          <span>
                            ${((m?.price || 0) * i.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOrderSubmit}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20"
                  >
                    Submit Order to Kitchen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: KITCHEN DISPLAY SYSTEM (KDS) */}
      {subTab === "kds" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PENDING / NEW */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Pending Tickets (
                {pendingOrders.length})
              </span>
            </div>
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">
                    #{order.orderNumber} &bull;{" "}
                    {order.table?.tableNumber || "Takeout"}
                  </span>
                  <span className="text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="space-y-1 py-1 text-xs text-slate-300">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between font-semibold"
                    >
                      <span>
                        {item.quantity}x {item.menuItem?.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onUpdateOrderStatus(order.id, "PREPARING")}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm"
                >
                  Start Cooking (Move to Prep) &rarr;
                </button>
              </div>
            ))}
          </div>

          {/* PREPARING */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 animate-pulse" /> Cooking Station (
                {preparingOrders.length})
              </span>
            </div>
            {preparingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">
                    #{order.orderNumber} &bull;{" "}
                    {order.table?.tableNumber || "Takeout"}
                  </span>
                  <span className="text-amber-400 font-bold">15m Prep Est</span>
                </div>
                <div className="space-y-1 py-1 text-xs text-slate-300">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between font-semibold"
                    >
                      <span>
                        {item.quantity}x {item.menuItem?.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onUpdateOrderStatus(order.id, "READY")}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                >
                  Mark Order Ready &rarr;
                </button>
              </div>
            ))}
          </div>

          {/* READY / SERVED */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ready for Serving (
                {readyOrders.length})
              </span>
            </div>
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">
                    #{order.orderNumber} &bull;{" "}
                    {order.table?.tableNumber || "Takeout"}
                  </span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <div className="space-y-1 py-1 text-xs text-slate-300">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.menuItem?.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    onUpdateOrderStatus(order.id, "SERVED", "PAID")
                  }
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Complete Order & Mark Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MENU & RECIPES */}
      {subTab === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-36 object-cover rounded-xl border border-slate-800"
              />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {item.category?.name || "Main Course"}
                  </p>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-300">
                  Recipe Ingredients Required:
                </span>
                {item.recipes && item.recipes.length > 0 ? (
                  item.recipes.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between text-slate-400 text-[11px]"
                    >
                      <span>&bull; {r.ingredient?.name}</span>
                      <span>
                        {r.quantityRequired} {r.ingredient?.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Standard kitchen prep recipe
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(currentRole === "OWNER" || currentRole === "MANAGER") && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddMenuModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      )}

      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create Menu Item</h3>

              <button
                onClick={() => setShowAddMenuModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <input
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder="Menu Name"
              className="w-full glass-input p-3 rounded-xl"
            />

            <input
              type="number"
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
              placeholder="Price"
              className="w-full glass-input p-3 rounded-xl"
            />

            <input
              value={menuCategoryId}
              onChange={(e) => setMenuCategoryId(e.target.value)}
              placeholder="Category ID"
              className="w-full glass-input p-3 rounded-xl"
            />

            <textarea
              value={menuDesc}
              onChange={(e) => setMenuDesc(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full glass-input p-3 rounded-xl"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!onCreateMenuItem) return;

                  await onCreateMenuItem({
                    name: menuName,
                    price: Number(menuPrice),
                    categoryId: menuCategoryId,
                    description: menuDesc,
                  });

                  setMenuName("");
                  setMenuPrice("15.00");
                  setMenuCategoryId("");
                  setMenuDesc("");
                  setShowAddMenuModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Create Menu Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Dining Table</h3>
              <button
                onClick={() => setShowAddTableModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Table Number / Label
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 15"
                  className="w-full glass-input p-2.5 rounded-xl text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(e.target.value)}
                  placeholder="4"
                  className="w-full glass-input p-2.5 rounded-xl text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Section
                </label>
                <select
                  value={tableSection}
                  onChange={(e) => setTableSection(e.target.value)}
                  className="w-full glass-input p-2.5 rounded-xl text-white border border-slate-700 bg-slate-900"
                >
                  <option value="Main Dining">Main Dining</option>
                  <option value="Patio Window">Patio Window</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Bar & Counter">Bar & Counter</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddTableModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!tableNumber || !onCreateTable) return;
                  await onCreateTable({
                    tableNumber,
                    capacity: Number(tableCapacity),
                    section: tableSection,
                  });
                  setShowAddTableModal(false);
                  setTableNumber("");
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
