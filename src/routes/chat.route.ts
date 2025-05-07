import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery, getChatByUserId } from "../controllers/chat.controller";

const router = Router();

router.post("/askQuery", protectRoute([RoleEnum[0]]), askQuery);
router.get("/history/:user_id", protectRoute([RoleEnum[0]]), getChatByUserId);

export default router;