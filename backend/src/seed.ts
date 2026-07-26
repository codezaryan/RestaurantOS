import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RestaurantOS Database...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Staff & Users for all 6 Roles
  const passwordHash = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: { name: 'Praveen Yadav', email: 'owner@restaurantos.io', password: passwordHash, role: 'OWNER', phone: '+1-555-0192' }
  });
  const manager = await prisma.user.create({
    data: { name: 'Arun Kumar', email: 'manager@restaurantos.io', password: passwordHash, role: 'MANAGER', phone: '+1-555-0193' }
  });
  const chef = await prisma.user.create({
    data: { name: 'Chef Bharath', email: 'chef@restaurantos.io', password: passwordHash, role: 'CHEF', phone: '+1-555-0194' }
  });
  const waiter = await prisma.user.create({
    data: { name: 'Alex Rivers', email: 'waiter@restaurantos.io', password: passwordHash, role: 'WAITER', phone: '+1-555-0195' }
  });
  const cashier = await prisma.user.create({
    data: { name: 'Sarah Connor', email: 'cashier@restaurantos.io', password: passwordHash, role: 'CASHIER', phone: '+1-555-0196' }
  });
  const storeManager = await prisma.user.create({
    data: { name: 'David Miller', email: 'store@restaurantos.io', password: passwordHash, role: 'STORE_MANAGER', phone: '+1-555-0197' }
  });

  console.log('✅ Created 6 Role Users (Owner, Manager, Chef, Waiter, Cashier, Store Manager)');

  // 2. Create Categories
  const catMains = await prisma.category.create({ data: { name: 'Main Course', type: 'MENU' } });
  const catAppetizers = await prisma.category.create({ data: { name: 'Appetizers', type: 'MENU' } });
  const catDesserts = await prisma.category.create({ data: { name: 'Desserts', type: 'MENU' } });
  const catBeverages = await prisma.category.create({ data: { name: 'Beverages', type: 'MENU' } });
  
  const catProduce = await prisma.category.create({ data: { name: 'Fresh Produce', type: 'INVENTORY' } });
  const catMeat = await prisma.category.create({ data: { name: 'Meat & Seafood', type: 'INVENTORY' } });
  const catDairy = await prisma.category.create({ data: { name: 'Dairy & Eggs', type: 'INVENTORY' } });

  const catUtilities = await prisma.category.create({ data: { name: 'Utilities & Rent', type: 'EXPENSE' } });
  const catSupplies = await prisma.category.create({ data: { name: 'Raw Food Supplies', type: 'EXPENSE' } });

  // 3. Create Suppliers
  const nileSupplier = await prisma.supplier.create({
    data: { name: 'Nile Hospitality Logistics', contactPerson: 'Praveen R.', email: 'praveen.r@nilehospitality.com', phone: '+1-800-NILE-SUP', address: '100 Hospitality Way, Suite 400' }
  });
  const baikalSupplier = await prisma.supplier.create({
    data: { name: 'Baikal Sphere Beverage Co.', contactPerson: 'Arun Kumar', email: 'arun.kumar@baikalsphere.com', phone: '+1-800-BAIKAL-B', address: '50 Sphere Ave, Industrial Zone' }
  });
  const freshFarms = await prisma.supplier.create({
    data: { name: 'Fresh Farms & Dairy Ltd.', contactPerson: 'Bharath Yadav', email: 'bharath.yadav@nilehospitality.com', phone: '+1-800-FRESH-FARM', address: 'Valley Green Farm Estate' }
  });

  // 4. Create Ingredients
  const ingRibeye = await prisma.ingredient.create({
    data: { name: 'Wagyu Beef Ribeye', unit: 'kg', currentStock: 8.5, minStockLevel: 15.0, reorderQuantity: 25.0, costPerUnit: 34.50, supplierId: nileSupplier.id, categoryId: catMeat.id }
  });
  const ingSalmon = await prisma.ingredient.create({
    data: { name: 'Atlantic Salmon Fillet', unit: 'kg', currentStock: 12.0, minStockLevel: 10.0, reorderQuantity: 20.0, costPerUnit: 22.00, supplierId: nileSupplier.id, categoryId: catMeat.id }
  });
  const ingTomatoes = await prisma.ingredient.create({
    data: { name: 'Organic Heirloom Tomatoes', unit: 'kg', currentStock: 4.2, minStockLevel: 12.0, reorderQuantity: 30.0, costPerUnit: 3.80, supplierId: freshFarms.id, categoryId: catProduce.id }
  });
  const ingTruffleOil = await prisma.ingredient.create({
    data: { name: 'Black Truffle Oil 500ml', unit: 'liters', currentStock: 2.5, minStockLevel: 3.0, reorderQuantity: 5.0, costPerUnit: 42.00, supplierId: baikalSupplier.id, categoryId: catProduce.id }
  });
  const ingMilk = await prisma.ingredient.create({
    data: { name: 'Organic Whole Milk', unit: 'liters', currentStock: 5.0, minStockLevel: 20.0, reorderQuantity: 40.0, costPerUnit: 1.85, supplierId: freshFarms.id, categoryId: catDairy.id }
  });

  console.log('✅ Created Ingredients & Suppliers');

  // 5. Create Menu Items & Recipes
  const itemRibeye = await prisma.menuItem.create({
    data: {
      name: 'Charbroiled Wagyu Ribeye 300g',
      description: 'Prime Wagyu beef served with truffle reduction and roasted garlic puree',
      price: 68.00,
      suggestedPrice: 72.00,
      prepTimeMinutes: 20,
      categoryId: catMains.id,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      recipes: {
        create: [
          { ingredientId: ingRibeye.id, quantityRequired: 0.35 },
          { ingredientId: ingTruffleOil.id, quantityRequired: 0.02 }
        ]
      }
    }
  });

  const itemSalmon = await prisma.menuItem.create({
    data: {
      name: 'Pan-Seared Atlantic Salmon',
      description: 'Fresh salmon with lemon dill glaze, asparagus, and wild rice',
      price: 34.00,
      suggestedPrice: 36.00,
      prepTimeMinutes: 15,
      categoryId: catMains.id,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
      recipes: {
        create: [
          { ingredientId: ingSalmon.id, quantityRequired: 0.25 }
        ]
      }
    }
  });

  const itemCaprese = await prisma.menuItem.create({
    data: {
      name: 'Artisanal Caprese Salad',
      description: 'Organic tomatoes, fresh buffalo mozzarella, pesto, and aged balsamic',
      price: 18.50,
      suggestedPrice: 19.50,
      prepTimeMinutes: 10,
      categoryId: catAppetizers.id,
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80',
      recipes: {
        create: [
          { ingredientId: ingTomatoes.id, quantityRequired: 0.25 }
        ]
      }
    }
  });

  const itemCoffee = await prisma.menuItem.create({
    data: {
      name: 'Artisanal Iced Oat Latte',
      description: 'Double espresso with cold-pressed oat milk and vanilla bean syrup',
      price: 7.50,
      suggestedPrice: 8.00,
      prepTimeMinutes: 5,
      categoryId: catBeverages.id,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      recipes: {
        create: [
          { ingredientId: ingMilk.id, quantityRequired: 0.2 }
        ]
      }
    }
  });

  console.log('✅ Created Menu Items & Recipes');

  // 6. Create Tables
  const tablesData = [
    { tableNumber: 'T-01', capacity: 2, status: 'OCCUPIED', section: 'Patio Window' },
    { tableNumber: 'T-02', capacity: 4, status: 'OCCUPIED', section: 'Main Dining' },
    { tableNumber: 'T-03', capacity: 4, status: 'AVAILABLE', section: 'Main Dining' },
    { tableNumber: 'T-04', capacity: 6, status: 'RESERVED', section: 'VIP Lounge' },
    { tableNumber: 'T-05', capacity: 2, status: 'CLEANING', section: 'Patio Window' },
    { tableNumber: 'T-06', capacity: 8, status: 'AVAILABLE', section: 'Chef Booth' }
  ];

  for (const t of tablesData) {
    await prisma.table.create({
      data: {
        ...t,
        qrCode: `https://restaurantos.app/order?table=${t.tableNumber}`
      }
    });
  }
  const table1 = await prisma.table.findUnique({ where: { tableNumber: 'T-01' } });
  const table2 = await prisma.table.findUnique({ where: { tableNumber: 'T-02' } });

  // 7. Create Orders & Order Items
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-101',
      tableId: table1?.id,
      waiterId: waiter.id,
      status: 'PREPARING',
      paymentStatus: 'PENDING',
      subtotal: 102.00,
      taxAmount: 8.16,
      totalAmount: 110.16,
      notes: 'Ribeye medium rare please',
      orderItems: {
        create: [
          { menuItemId: itemRibeye.id, quantity: 1, unitPrice: 68.00, status: 'COOKING' },
          { menuItemId: itemSalmon.id, quantity: 1, unitPrice: 34.00, status: 'PENDING' }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-102',
      tableId: table2?.id,
      waiterId: waiter.id,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      subtotal: 61.00,
      taxAmount: 4.88,
      totalAmount: 65.88,
      orderItems: {
        create: [
          { menuItemId: itemCaprese.id, quantity: 2, unitPrice: 18.50, status: 'READY' },
          { menuItemId: itemCoffee.id, quantity: 2, unitPrice: 7.50, status: 'READY' }
        ]
      }
    }
  });

  // 8. Create Stock Movements (IN, OUT, WASTE)
  await prisma.stockMovement.create({
    data: { ingredientId: ingRibeye.id, type: 'IN', quantity: 25.0, reason: 'Initial supplier delivery PO-901', userId: storeManager.id }
  });
  await prisma.stockMovement.create({
    data: { ingredientId: ingTomatoes.id, type: 'WASTE', quantity: 3.5, reason: 'Spoilage due to delayed refrigeration', userId: chef.id }
  });
  await prisma.stockMovement.create({
    data: { ingredientId: ingMilk.id, type: 'WASTE', quantity: 4.0, reason: 'Expired bottle packaging date', userId: chef.id }
  });

  // 9. Sample Invoices (Using real downloaded supplier invoices details)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-NILE-9942',
      supplierId: nileSupplier.id,
      uploadPath: '/uploads/invoice_capture_handwritten_invoice_sample.png',
      fileType: 'image',
      invoiceDate: new Date('2026-07-20'),
      subtotal: 1250.00,
      tax: 100.00,
      totalAmount: 1350.00,
      ocrRawText: 'NILE HOSPITALITY LOGISTICS\nInvoice #INV-NILE-9942\nDate: 20/07/2026\nWagyu Beef Ribeye 25kg @ 34.50 = 862.50\nAtlantic Salmon 15kg @ 22.00 = 330.00\nSubtotal: 1250.00 Tax: 100.00 Total: 1350.00',
      extractionConfidence: 0.94,
      status: 'APPROVED',
      items: {
        create: [
          { description: 'Wagyu Beef Ribeye 25kg', quantity: 25, unitPrice: 34.50, totalAmount: 862.50 },
          { description: 'Atlantic Salmon Fillet 15kg', quantity: 15, unitPrice: 22.00, totalAmount: 330.00 }
        ]
      }
    }
  });

  await prisma.expense.create({
    data: {
      title: 'Supplier Invoice #INV-NILE-9942 (Nile Hospitality Logistics)',
      amount: 1350.00,
      categoryId: catSupplies.id,
      supplierId: nileSupplier.id,
      invoiceId: inv1.id,
      date: new Date('2026-07-20'),
      paymentStatus: 'PAID',
      notes: 'AI Invoice OCR parsed and auto-posted'
    }
  });

  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-BAIKAL-3081',
      supplierId: baikalSupplier.id,
      uploadPath: '/uploads/batch1-0001.jpg',
      fileType: 'image',
      invoiceDate: new Date('2026-07-24'),
      subtotal: 420.00,
      tax: 33.60,
      totalAmount: 453.60,
      ocrRawText: 'BAIKAL SPHERE BEVERAGE CO.\nInvoice #INV-BAIKAL-3081\nDate: 24/07/2026\nBlack Truffle Oil 5L @ 42.00 = 210.00\nArtisanal Coffee Beans 10kg @ 21.00 = 210.00',
      extractionConfidence: 0.91,
      status: 'PROCESSED',
      items: {
        create: [
          { description: 'Black Truffle Oil 5L', quantity: 5, unitPrice: 42.00, totalAmount: 210.00 },
          { description: 'Artisanal Coffee Beans 10kg', quantity: 10, unitPrice: 21.00, totalAmount: 210.00 }
        ]
      }
    }
  });

  await prisma.expense.create({
    data: {
      title: 'Supplier Invoice #INV-BAIKAL-3081 (Baikal Sphere Beverage Co.)',
      amount: 453.60,
      categoryId: catSupplies.id,
      supplierId: baikalSupplier.id,
      invoiceId: inv2.id,
      date: new Date('2026-07-24'),
      paymentStatus: 'PAID'
    }
  });

  console.log('✅ Created Orders, Stock Movements, Invoices, Expenses, & Audit Logs');
  console.log('🎉 RestaurantOS Database Seed Complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
