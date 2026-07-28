import { OCRService } from "../ai/ocr.service";
import { ExcelService } from "../ai/excel.service";
import { invoicesRepository } from "./invoices.repository";

class InvoicesService {

    private readonly ocrService = new OCRService();
    private readonly excelService = new ExcelService();

    async getAll() {
        return invoicesRepository.findAll();
    }

    async uploadInvoices(
        files: Express.Multer.File[],
        user: any
    ) {

        const processedInvoices = [];

        for (const file of files) {

            const extracted =
                await this.ocrService.processInvoice(file.path);

            let supplier =
                await invoicesRepository.findSupplier(
                    extracted.supplierName
                );

            if (!supplier) {

                supplier =
                    await invoicesRepository.createSupplier({
                        name: extracted.supplierName,
                        contactPerson: "Accounts Manager",
                        email: `billing@${extracted.supplierName
                            .toLowerCase()
                            .replace(/[^a-z]/g, "")}.com`
                    });

            }

            const invoice =
                await invoicesRepository.createInvoice({
                    extracted,
                    supplier,
                    file
                });

            const category =
                await invoicesRepository.findExpenseCategory();

            await invoicesRepository.createExpense({
                invoice,
                supplier,
                category
            });

            await invoicesRepository.createAudit({
                invoice,
                supplier,
                confidence: extracted.confidence,
                user
            });

            processedInvoices.push(invoice);

        }

        return {
            message: `Successfully processed ${processedInvoices.length} supplier invoice(s)`,
            invoices: processedInvoices
        };

    }

    async exportExpenseRegister() {
        return this.excelService.generateExpenseRegister();
    }

}

export const invoicesService = new InvoicesService();