import express from 'express';
import * as stripeController from '../controllers/stripe.controller.js';

const router = express.Router();

// Route per creare una sessione di checkout
router.post('/create-checkout-session', stripeController.PaymentRequest);

// Route webhook con middleware raw applicato esplicitamente
router.post('/webhook', stripeController.stripeWebhookMiddleware, stripeController.handleStripeWebhook);

// Route per verificare lo stato del pagamento
router.get('/checkout-status/:sessionId', stripeController.checkPaymentStatus);

export default router;

