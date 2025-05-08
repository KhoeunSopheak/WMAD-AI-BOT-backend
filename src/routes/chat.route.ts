import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery, deleteChat, getAllChats, getChatById, getChatByUserId } from "../controllers/chat.controller";

const router = Router();

router.post("/askQuery", protectRoute([RoleEnum[0]]), askQuery);
router.get("/", protectRoute([RoleEnum[0]]), getAllChats);
router.get("/:id", protectRoute([RoleEnum[0]]), getChatById);
router.get("/history/:user_id", protectRoute([RoleEnum[0]]), getChatByUserId);
router.delete("remove/:id", protectRoute([RoleEnum[0]]), deleteChat);

export default router;