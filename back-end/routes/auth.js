import { Router } from "express";
import * as userController from "../controllers/auth.controller.js";

const router = Router()


router.post("/auth/register",userController.freshRegister);
router.post("/auth/login", userController.verifyToken, userController.login);
router.post("/auth/login-google", userController.loginGoogle);
router.get("/auth/user", userController.readUser);
router.put("/auth/user",userController.verifyToken ,  userController.updateUser);
router.delete("/auth/user", userController.verifyToken, userController.deleteUser);
router.post("/auth/logout", userController.logout);


export default router;