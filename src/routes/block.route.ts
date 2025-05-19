import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery } from "../service/serviceChat/saveChat";
import { deleteBlock, getAllBlocks, getBlockById, getBlockByUserId, totalAllBlocks } from "../controllers/block.controller";

const router = Router();

router.post("/", protectRoute([RoleEnum[1]]), askQuery);
router.get("/", protectRoute([RoleEnum[1]]), getAllBlocks);
router.get("/total", protectRoute([RoleEnum[1]]), totalAllBlocks);
router.get("/:id", protectRoute([RoleEnum[1]]), getBlockById);
router.get("/:user_id", protectRoute([RoleEnum[1]]), getBlockByUserId);
router.delete("/remove/:id", protectRoute([RoleEnum[1]]), deleteBlock);

export default router;