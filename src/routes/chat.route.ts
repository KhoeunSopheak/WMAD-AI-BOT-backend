import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { deleteChat, getAllChats, getChatById, getChatByUserId, updateChat } from "../controllers/chat.controller";
import { blockIfDisabled } from "../midleware/auth.midleware";
import { askQuery } from "../service/serviceChat/saveChat";

const router = Router();

router.post("/askQuery", protectRoute([RoleEnum[0], RoleEnum[1]]), blockIfDisabled, askQuery);
router.get("/", protectRoute([RoleEnum[0], RoleEnum[1]]), getAllChats);
router.get("/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), getChatById);
router.get("/history/:user_id", protectRoute([RoleEnum[0], RoleEnum[1]]), getChatByUserId);
router.delete("remove/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), deleteChat);
router.put("/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), updateChat);
export default router;