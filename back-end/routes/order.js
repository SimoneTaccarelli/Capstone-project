import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import * as authcontroller from "../controllers/auth.controller.js";


const router = Router();

// Rotte pubbliche
router.get("/public/:orderId", orderController.getPublicOrder); // Per visualizzare ordine con link pubblico

// Rotte per utenti autenticati
router.get("/my-orders", authcontroller.verifyToken, orderController.getUserOrders); // Ordini dell'utente loggato
router.get("/:orderId", authcontroller.verifyToken, orderController.getOrderById); // Singolo ordine (verifica proprietà)

// Rotte per admin
router.get("/", authcontroller.verifyToken, authcontroller.isAdministrator, orderController.getAllOrders); // Tutti gli ordini
router.put("/:orderId/status", authcontroller.verifyToken, authcontroller.isAdministrator, orderController.updateOrderStatus); // Aggiorna stato
router.delete("/:orderId", authcontroller.verifyToken, authcontroller.isAdministrator, orderController.deleteOrder); // Elimina ordine

export default router;

