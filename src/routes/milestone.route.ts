import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { milestoneController } from "../controllers/milestone.controller";

const router = Router();

router.post("/",protectRoute([RoleEnum[0]]), milestoneController);


export default router;