import { Router } from "express";
import * as salesController from "../controllers/sales.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.get("/sales", authController.isAdminMiddleware, salesController.getAllSales);
router.get("/sales/:saleId", authController.isAdminMiddleware, salesController.getSaleById);
router.post("/sales", authController.isAdminMiddleware, salesController.createSale);
router.put("/sales/:saleId", authController.isAdminMiddleware, salesController.updateSale);
router.delete("/sales/:saleId", authController.isAdminMiddleware, salesController.deleteSale);

export default router;
