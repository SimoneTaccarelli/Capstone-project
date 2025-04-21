import { Router } from "express";
import * as userController from "../controllers/auth.controller.js";
import { avatarUpload } from "../utilities/cloudinary.js";

const router = Router()


router.post("/auth/register",userController.freshRegister);
router.get("/auth/me", userController.verifyToken, userController.getUserData);
router.post("/auth/login", userController.login );
router.post("/auth/login-google", userController.loginGoogle);
router.put(
  "/auth/modifyUser", 
  userController.verifyToken,
  avatarUpload.single('profilePic'), // Aggiungi Multer come middleware
  userController.updateUser
);
router.delete("/auth/cancelUser", userController.verifyToken, userController.eliminateUser);



export default router;