import{Router} from 'express';
import * as productController from '../controllers/product.controller.js';
import { upload } from '../utilities/cloudinary.js';
import * as userController from '../controllers/auth.controller.js';

const router = Router();

router.get('/product', productController.getAllProducts);
router.get('/product/:productId', productController.getProductById);
router.post('/product', userController.verifyToken, userController.isAdministrator, upload.array('images', 5), productController.createProduct);
router.put('/product/:productId', userController.verifyToken, userController.isAdministrator, upload.array('images', 5), productController.updateProduct);
router.delete('/product/:productId', userController.verifyToken, userController.isAdministrator, productController.eliminateProduct);
router.patch('/product/:productId/stock', userController.verifyToken, userController.isAdministrator, productController.updateProductStock);

export default router;