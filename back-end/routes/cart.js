import Router from 'express';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

router.get('/getCart', cartController.getCart);
router.post('/addToCart',cartController.addToCart);
router.delete('/removeFromCart', cartController.removeFromCart);
router.put('/updateCart',cartController.updateCart);
router.delete('/clearCart', cartController.clearCart);
router.post('/create-instagram-message', cartController.createInstagramMessage);

export default router;