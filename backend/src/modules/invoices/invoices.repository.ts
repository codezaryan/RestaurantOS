import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const invoicesRepository = {
  findAll() {
    return prisma.invoice.findMany({
      include: { supplier: true, items: true, expenses: true },
      orderBy: { createdAt: "desc" }
    });
  },

  findSupplier(name: string) {
    return prisma.supplier.findFirst({
      where: { name: { contains: name } }
    });
  },

  createSupplier(data: any) {
    return prisma.supplier.create({ data });
  },

  createInvoice(data: any) {
    const { extracted, supplier, file } = data;
    return prisma.invoice.create({
      data: {
        invoiceNumber: extracted.invoiceNumber,
        supplierId: supplier.id,
        uploadPath: `/uploads/${file.filename}`,
        fileType: file.mimetype.includes("pdf") ? "pdf" : "image",
        invoiceDate: extracted.invoiceDate ? new Date(extracted.invoiceDate) : new Date(),
        subtotal: extracted.subtotal,
        tax: extracted.tax,
        totalAmount: extracted.totalAmount,
        ocrRawText: extracted.rawText,
        extractionConfidence: extracted.confidence,
        status: "PROCESSED",
        items: {
          create: extracted.lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.totalAmount
          }))
        }
      },
      include: { supplier: true, items: true }
    });
  },

  findExpenseCategory() {
    return prisma.category.findFirst({ where: { type: "EXPENSE" } });
  },

  createExpense(data: any) {
    const { invoice, supplier, category } = data;
    return prisma.expense.create({
      data: {
        title: `Supplier Invoice #${invoice.invoiceNumber} (${supplier.name})`,
        amount: invoice.totalAmount,
        categoryId: category?.id,
        supplierId: supplier.id,
        invoiceId: invoice.id,
        date: invoice.invoiceDate || new Date(),
        paymentStatus: "PAID",
        notes: "Auto-extracted via AI Invoice OCR parser"
      }
    });
  },

  deleteInvoice(id: string) {
    return prisma.invoice.delete({ where: { id } });
  },

  createAudit(data: any) {
    const { invoice, supplier, confidence, user } = data;
    return prisma.auditLog.create({
      data: {
        userId: user?.id,
        userName: user?.name,
        action: "AI_INVOICE_PROCESSED",
        module: "EXPENSE_MANAGEMENT",
        details: `Processed invoice #${invoice.invoiceNumber} for $${invoice.totalAmount} with ${(confidence * 100).toFixed(0)}% confidence`
      }
    });
  }
};
