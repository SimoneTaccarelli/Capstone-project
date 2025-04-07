import { Router } from "express";
import * as userController from "../controllers/auth.controller.js";

const router = Router()


router.post("/auth/register",userController.freshRegister);
router.post("/auth/login", userController.login );
router.post("/auth/login-google", userController.loginGoogle);
router.put("/auth/modifyUser",userController.verifyToken ,  userController.updateUser);
router.delete("/auth/cancelUser", userController.verifyToken, userController.eliminateUser);



export default router;