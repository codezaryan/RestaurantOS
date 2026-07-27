"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ExcelService {
    /**
     * Export Expense Register to styled Excel file buffer
     */
    async generateExpenseRegister() {
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'RestaurantOS AI Platform';
        workbook.created = new Date();
        // Sheet 1: Expenses Summary
        const expenseSheet = workbook.addWorksheet('Expense Register', {
            views: [{ showGridLines: true }]
        });
        // Header Styling
        expenseSheet.mergeCells('A1:G1');
        const titleCell = expenseSheet.getCell('A1');
        titleCell.value = 'RestaurantOS - Official Expense & Supplier Register';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Dark Navy Slate
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        expenseSheet.getRow(1).height = 35;
        // Table Headers
        expenseSheet.getRow(3).values = [
            'Expense ID',
            'Title',
            'Category',
            'Supplier',
            'Date',
            'Status',
            'Amount ($)'
        ];
        expenseSheet.getRow(3).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        expenseSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; // Royal Blue
        expenseSheet.getRow(3).alignment = { horizontal: 'center', vertical: 'middle' };
        expenseSheet.getRow(3).height = 25;
        // Fetch expenses from DB
        const expenses = await prisma.expense.findMany({
            include: { category: true, supplier: true },
            orderBy: { date: 'desc' }
        });
        let rowIndex = 4;
        let totalExpenses = 0;
        for (const exp of expenses) {
            const row = expenseSheet.getRow(rowIndex);
            row.values = [
                exp.id.slice(0, 8).toUpperCase(),
                exp.title,
                exp.category?.name || 'General',
                exp.supplier?.name || 'N/A',
                new Date(exp.date).toLocaleDateString(),
                exp.paymentStatus,
                exp.amount
            ];
            totalExpenses += exp.amount;
            row.getCell(7).numFmt = '$#,##0.00';
            row.alignment = { vertical: 'middle' };
            if (rowIndex % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            }
            rowIndex++;
        }
        // Summary Row
        const summaryRow = expenseSheet.getRow(rowIndex + 1);
        summaryRow.values = ['', '', '', '', '', 'TOTAL EXPENSES:', totalExpenses];
        summaryRow.font = { name: 'Arial', size: 12, bold: true };
        summaryRow.getCell(7).numFmt = '$#,##0.00';
        summaryRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light Green
        // Column widths
        expenseSheet.columns = [
            { width: 14 },
            { width: 30 },
            { width: 20 },
            { width: 28 },
            { width: 14 },
            { width: 14 },
            { width: 16 }
        ];
        // Sheet 2: Processed AI Invoices
        const invoiceSheet = workbook.addWorksheet('AI Invoices Log');
        invoiceSheet.getRow(1).values = ['Invoice #', 'Supplier', 'Date', 'Subtotal', 'Tax', 'Total Amount', 'Confidence', 'Status'];
        invoiceSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        invoiceSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        const invoices = await prisma.invoice.findMany({ include: { supplier: true } });
        let invRow = 2;
        for (const inv of invoices) {
            invoiceSheet.getRow(invRow).values = [
                inv.invoiceNumber,
                inv.supplier?.name || 'Extracted Supplier',
                inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A',
                inv.subtotal,
                inv.tax,
                inv.totalAmount,
                `${(inv.extractionConfidence * 100).toFixed(0)}%`,
                inv.status
            ];
            invRow++;
        }
        invoiceSheet.columns = [
            { width: 18 }, { width: 30 }, { width: 14 }, { width: 14 },
            { width: 12 }, { width: 16 }, { width: 14 }, { width: 16 }
        ];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.ExcelService = ExcelService;
