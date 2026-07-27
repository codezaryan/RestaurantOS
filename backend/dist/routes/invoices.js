"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const ocrService_1 = require("../services/ocrService");
const excelService_1 = require("../services/excelService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const ocrService = new ocrService_1.OCRService();
const excelService = new excelService_1.ExcelService();
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }
});
// GET /api/invoices
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { supplier: true, items: true, expenses: true },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(invoices);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});
// POST /api/invoices/upload
router.post('/upload', auth_1.authenticateToken, upload.array('invoices', 10), async (req, res) => {
    try {
        const files = req.files;
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
    }
    catch (error) {
        console.error('Invoice OCR error:', error);
        return res.status(500).json({ error: 'Failed to process invoice OCR upload' });
    }
});
// GET /api/invoices/export-excel
router.get('/export-excel', auth_1.authenticateToken, async (req, res) => {
    try {
        const excelBuffer = await excelService.generateExpenseRegister();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Expense_Register_${Date.now()}.xlsx`);
        return res.send(excelBuffer);
    }
    catch (error) {
        console.error('Excel Export error:', error);
        return res.status(500).json({ error: 'Failed to generate Excel Expense Register' });
    }
});
exports.default = router;
