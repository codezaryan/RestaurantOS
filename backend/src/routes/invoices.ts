import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { OCRService } from '../services/ocrService';
import { ExcelService } from '../services/excelService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const ocrService = new OCRService();
const excelService = new ExcelService();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// GET /api/invoices
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { supplier: true, items: true, expenses: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/invoices/upload
router.post('/upload', authenticateToken, upload.array('invoices', 10), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No invoice files uploaded' });
    }

    const processedInvoices = [];

    for (const file of files) {
      const extractedData = await ocrService.processInvoice(file.path);

      let supplier = await prisma.supplier.findFirst({
        where: { name: { contains: extractedData.supplierName } }
      });

      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: {
            name: extractedData.supplierName,
            contactPerson: 'Accounts Manager',
            email: `billing@${extractedData.supplierName.toLowerCase().replace(/[^a-z]/g, '')}.com`
          }
        });
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: extractedData.invoiceNumber,
          supplierId: supplier.id,
          uploadPath: `/uploads/${file.filename}`,
          fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
          invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : new Date(),
          subtotal: extractedData.subtotal,
          tax: extractedData.tax,
          totalAmount: extractedData.totalAmount,
          ocrRawText: extractedData.rawText,
          extractionConfidence: extractedData.confidence,
          status: 'PROCESSED',
          items: {
            create: extractedData.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.totalAmount
            }))
          }
        },
        include: { supplier: true, items: true }
      });

      let defaultCategory = await prisma.category.findFirst({ where: { type: 'EXPENSE' } });
      await prisma.expense.create({
        data: {
          title: `Supplier Invoice #${invoice.invoiceNumber} (${supplier.name})`,
          amount: invoice.totalAmount,
          categoryId: defaultCategory?.id,
          supplierId: supplier.id,
          invoiceId: invoice.id,
          date: invoice.invoiceDate || new Date(),
          paymentStatus: 'PAID',
          notes: `Auto-extracted via AI Invoice OCR parser`
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userName: req.user?.name,
          action: 'AI_INVOICE_PROCESSED',
          module: 'EXPENSE_MANAGEMENT',
          details: `Processed invoice #${invoice.invoiceNumber} for $${invoice.totalAmount} with ${(extractedData.confidence * 100).toFixed(0)}% confidence`
        }
      });

      processedInvoices.push(invoice);
    }

    return res.status(201).json({
      message: `Successfully processed ${processedInvoices.length} supplier invoice(s)`,
      invoices: processedInvoices
    });
  } catch (error) {
    console.error('Invoice OCR error:', error);
    return res.status(500).json({ error: 'Failed to process invoice OCR upload' });
  }
});

// GET /api/invoices/export-excel
router.get('/export-excel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const excelBuffer = await excelService.generateExpenseRegister();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Expense_Register_${Date.now()}.xlsx`);
    return res.send(excelBuffer);
  } catch (error) {
    console.error('Excel Export error:', error);
    return res.status(500).json({ error: 'Failed to generate Excel Expense Register' });
  }
});

export default router;
