import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as graphicController from '../controllers/graphic.controller.js';
import { graphicUpload } from '../utilities/cloudinary.js';

const router = Router();

router.get('/graphics', graphicController.getAllGraphics);
router.get('/graphic/:graphicId/products', graphicController.getProductsByGraphic);
router.get('/graphic/:graphicId', graphicController.getGraphicById);
router.post('/graphicUpload', authController.isAdminMiddleware, graphicUpload.array('images', 5), graphicController.graphicUpload);
router.put('/graphic/:graphicId', authController.isAdminMiddleware, graphicUpload.array('images', 5), (req, res, next) => {
  console.log('Files ricevuti:', req.files);
  next();
}, graphicController.modifyGraphic);
router.delete('/graphic/:graphicId', authController.isAdminMiddleware, graphicController.eliminateGraphic);

export default router;
