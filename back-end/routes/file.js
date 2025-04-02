import { Router } from "express";
import * as fileController from "../controllers/file.controller.js";
import { upload } from "../utilities/cloudinary.js";

const router = Router();

router.get("/file", fileController.getAllFiles);
router.get("/file/:fileId", fileController.getFilesByFolderId);
router.post("/file/upload", upload.single('image'), fileController.uploadFile);

export default router;