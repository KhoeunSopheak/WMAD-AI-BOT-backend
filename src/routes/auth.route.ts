import { Router } from "express";
import { getAllUsers, login, register, totalAllUsers } from "../controllers/auth.controller";
import { validateLogin, validateUser } from "../midleware/validation.midleware";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";


const router = Router();

router.post("/register", validateUser, register);
router.post("/login", validateLogin, login);
router.get("/", protectRoute([RoleEnum[0]]), getAllUsers);
router.get("/total", protectRoute([RoleEnum[0]]), totalAllUsers);

export default router;