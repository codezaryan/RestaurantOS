import { Router } from "express";
import {
    authenticateToken,
    requireRoles
} from "../../middleware/auth";

import { upload } from "./multer.config";
import * as controller from "./invoices.controller";

const router = Router();

router.get(
    "/",
    authenticateToken,
    requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
    controller.getAll
);

router.post(
    "/upload",
    authenticateToken,
    requireRoles("OWNER", "MANAGER", "STORE_MANAGER"),
    upload.array("invoices", 10),
    controller.uploadInvoices
);

router.get(
    "/export-excel",
    authenticateToken,
    requireRoles("OWNER", "MANAGER"),
    controller.exportExcel
);

router.delete(
    "/:id",
    authenticateToken,
    requireRoles("OWNER", "MANAGER"),
    controller.deleteInvoice
);

export default router;