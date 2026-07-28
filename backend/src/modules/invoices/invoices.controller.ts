import { Request, Response } from "express";
import { invoicesService } from "./invoices.service";

export const getAll = async (
    req: Request,
    res: Response
) => {

    try {

        const invoices = await invoicesService.getAll();

        return res.json(invoices);

    } catch {

        return res.status(500).json({
            error: "Failed to fetch invoices"
        });

    }

};

export const uploadInvoices = async (
    req: any,
    res: Response
) => {

    try {

        const files = req.files as Express.Multer.File[];

        if (!files?.length) {
            return res.status(400).json({
                error: "No invoice files uploaded"
            });
        }

        const result = await invoicesService.uploadInvoices(
            files,
            req.user
        );

        return res.status(201).json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Failed to process invoice OCR upload"
        });

    }

};

export const exportExcel = async (
    req: Request,
    res: Response
) => {

    try {

        const buffer =
            await invoicesService.exportExpenseRegister();

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Expense_Register_${Date.now()}.xlsx`
        );

        return res.send(buffer);

    } catch {

        return res.status(500).json({
            error: "Failed to generate Excel Expense Register"
        });

    }

};