import { Router } from "express";
import { deleteUsers, disableUser, enableUser, getAllUsers, getUserById, getUsersGroupedByDate, login, register, totalAllUsers } from "../controllers/auth.controller";
import { validateLogin, validateUser } from "../midleware/validation.midleware";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";


const router = Router();

router.post("/register", validateUser, register);
router.post("/login", validateLogin, login);
router.get("/", protectRoute([RoleEnum[1]]), getAllUsers);
router.get("/total", protectRoute([RoleEnum[1]]), totalAllUsers);
router.get("/stats", protectRoute([RoleEnum[1]]), getUsersGroupedByDate);
router.get("/:id", protectRoute([RoleEnum[1], RoleEnum[0]]), getUserById);
router.patch("/disable/:id", protectRoute([RoleEnum[1]]), disableUser);
router.patch("/enable/:id", protectRoute([RoleEnum[1]]), enableUser);
router.delete("/disable/:id", protectRoute([RoleEnum[1]]), deleteUsers);

export default router;