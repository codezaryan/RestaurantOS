# RestaurantOS - Fix Issues Impacting Assessment Criteria

## ✅ Step 1: Fix RBAC Enforcement on Backend Routes
- [x] Apply `requireRoles()` middleware to all protected routes across:
  - `routes/expenses.ts`
  - `routes/inventory.ts`
  - `routes/operations.ts`
  - `routes/ai.ts`
  - `routes/invoices.ts`
  - `routes/auth.ts` (for staff management endpoints)

## ✅ Step 2: Add Missing Purchase Orders Tab Content in InventoryView
- [x] Add JSX content for `activeSubTab === 'po'` in `InventoryView.tsx`
- [x] Add Stock Movement History subtab in InventoryView

## ✅ Step 3: Add Missing CRUD Endpoints
- [x] Add `PATCH /api/inventory/ingredients/:id` and `DELETE /api/inventory/ingredients/:id`
- [x] Add `PATCH /api/operations/menu/:id` and `DELETE /api/operations/menu/:id`
- [x] Add `PATCH /api/inventory/suppliers/:id` and `DELETE /api/inventory/suppliers/:id`
- [x] Add `PATCH /api/inventory/categories/:id` and `DELETE /api/inventory/categories/:id`

## ✅ Step 4: Add Stock Movement History UI in InventoryView
- [x] Add a 'movements' subtab and display stock movement log

## ✅ Step 5: Fix DashboardView CSS Typo
- [x] Replace invalid `space-[#1e293b]` with proper Tailwind class

## ✅ Step 6: Add Stock Validation Before Order Creation
- [x] Check sufficient stock exists before deducting ingredients
- [x] Return meaningful error if stock insufficient

## ✅ Step 7: Make Password Required for Staff Creation
- [x] Remove default password fallback, require password field

## ✅ Step 8: Add Audit Logging for Failed Login Attempts
- [x] Log failed login attempts to audit log

---

All fixes complete! Here's what was fixed:

### Applied Fixes Summary

1. **RBAC Enforcement** - Added `requireRoles()` middleware to ALL backend routes across auth, operations, inventory, expenses, invoices, and AI modules
2. **Purchase Orders Tab** - Added complete PO creation UI with supplier/ingredient selection, PO list display, and stock movements history tab
3. **Missing CRUD Endpoints** - Added PATCH/DELETE for ingredients, menu items, suppliers, and categories
4. **Stock Validation** - Orders now validate ingredient availability before deducting stock, rejecting orders with insufficient stock with detailed error messages
5. **Dashboard CSS Fix** - Removed invalid Tailwind class `space-[#1e293b]`
6. **Password Required** - Staff creation now requires password (removed insecure default 'password123')
7. **Failed Login Audit Trail** - Both user-not-found and wrong-password attempts are logged to the audit log
8. **Stock Movements API** - Added `getStockMovements()` to frontend API client

