import{Router} from 'express';
import * as productController from '../controllers/product.controller.js';
import {  productUpload } from '../utilities/cloudinary.js';
import * as userController from '../controllers/auth.controller.js';

const router = Router();

router.get('/product', productController.getAllProducts);
router.get('/product/:productId', productController.getProductById);
router.post('/product', productUpload.array('images', 5), (req, res, next) => {
    console.log("Files ricevuti:", req.files);
    next();
}, productController.createProduct);
router.put('/product/:productId',userController.isAdminMiddleware, productUpload.array('images', 5), productController.updateProduct);
router.delete('/product/:productId',userController.isAdminMiddleware, productController.eliminateProduct);


export default router;