import{Router} from 'express';
import * as productController from '../controllers/product.controller.js';
import { upload } from '../utilities/cloudinary.js';
import * as userController from '../controllers/auth.controller.js';

const router = Router();

router.get('/product', productController.getAllProducts);
router.get('/product/:productId', productController.getProductById);
router.post('/product', userController.verifyToken, userController.isAdmin, upload.single('image'), productController.createProduct);
router.put('/product/:productId', userController.verifyToken, userController.isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/product/:productId', userController.verifyToken, userController.isAdmin, productController.eliminateProduct);

export default router;