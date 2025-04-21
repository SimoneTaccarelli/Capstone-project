import { Router } from "express";
import * as fileController from "../controllers/file.controller.js";
import { 
  productUpload, 
  avatarUpload, 
  logoUpload, 
  frontImageUpload 
} from "../utilities/cloudinary.js";

const router = Router();

// ===== ROTTE GENERALI PER FILE =====
// Recupera tutti i file
router.get("/file", fileController.getAllFiles);

// Elimina file
router.delete("/file/:id", fileController.eliminateFile);

// ===== ROTTE PER UPLOAD PRODOTTI E AVATAR =====
// Upload immagine prodotto
router.post("/file/upload/product", productUpload.single('image'), fileController.uploadFile);

// Upload avatar utente
router.post("/file/upload/avatar", avatarUpload.single('image'), fileController.uploadFile);

// ===== ROTTE PER DESIGN =====
// Recupera impostazioni design (logo e frontImage)
router.get("/file/design", fileController.getDesignSettings);

// Upload logo
router.post("/file/upload/logo", logoUpload.single('image'), fileController.uploadLogoFile);

// Upload immagine frontale
router.post("/file/upload/frontimage", frontImageUpload.single('image'), fileController.uploadFrontImageFile);

export default router;