import { Router } from "express";
import { login, register } from "../controllers/authController";
import { validateLogin, validateUser } from "../midleware/validationMidleware";


const router = Router();

router.post("/register", validateUser, register);
router.post("/login", validateLogin, login);

export default router;