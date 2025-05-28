import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as graphicController from '../controllers/graphic.controller.js';
import { graphicUpload } from '../utilities/cloudinary.js';

const router = Router();

router.get('/graphic/:graphicId/products', graphicController.getProductsByGraphic);
router.get('/graphic/:graphicId', graphicController.getGraphicById);
router.post('/graphicUpload', authController.verifyToken, authController.isAdministrator, graphicUpload.array('images', 5), graphicController.graphicUpload);
router.put('/graphic/:graphicId', authController.verifyToken, authController.isAdministrator, graphicUpload.array('images', 5), graphicController.modifyGraphic);
router.delete('/graphic/:graphicId', authController.verifyToken, authController.isAdministrator, graphicController.eliminateGraphic);

export default router;
