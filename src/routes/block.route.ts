import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery, getBlockByUserId } from "../controllers/chat.controller";

const router = Router();

router.post("/", protectRoute([RoleEnum[0]]), askQuery);
router.get("/:user_id", protectRoute([RoleEnum[0]]), getBlockByUserId);

export default router;