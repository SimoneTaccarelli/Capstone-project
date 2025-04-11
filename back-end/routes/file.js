import { Router } from "express";
import * as fileController from "../controllers/file.controller.js";
import { productUpload, avatarUpload, designUpload } from "../utilities/cloudinary.js";

const router = Router();

// Rotte per recuperare i file
router.get("/file", fileController.getAllFiles);
router.get("/file/:fileId", fileController.getFilesByFolderId);

// Rotte per caricare i file nelle cartelle specifiche
router.post("/file/upload/product", productUpload.single('image'), fileController.uploadFile);
router.post("/file/upload/avatar", avatarUpload.single('image'), fileController.uploadFile);
router.post("/file/upload/design", designUpload.single('image'), fileController.uploadFile);
router.get("/file/product" , fileController.getFilesByFolderId);
router.get("/file/avatar" , fileController.getFilesByFolderId);
router.get("/file/design" , fileController.getFilesByFolderId);
// Elimina file
router.delete("/file/:id", fileController.eliminateFile);

export default router;