import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery } from "../controllers/chat.controller";
import { deleteBlock, getAllBlocks, getBlockById, getBlockByUserId, totalAllBlocks } from "../controllers/block.controller";

const router = Router();

router.post("/", protectRoute([RoleEnum[0]]), askQuery);
router.get("/", protectRoute([RoleEnum[0]]), getAllBlocks);
router.get("/total", protectRoute([RoleEnum[0]]), totalAllBlocks);
router.get("/:id", protectRoute([RoleEnum[0]]), getBlockById);
router.get("/:user_id", protectRoute([RoleEnum[0]]), getBlockByUserId);
router.delete("remove/:id", protectRoute([RoleEnum[0]]), deleteBlock);

export default router;