import { Router } from "express";
import { getByIdRoadmap, getRoadmapByUserId, getRoadmapOptions,  } from "../controllers/roadmap.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";

const router = Router();

router.post("/generate-roadmap",protectRoute([RoleEnum[0]]), getRoadmapOptions);
router.get("/:user_id",protectRoute([RoleEnum[0]]), getRoadmapByUserId);
router.get("/:id", protectRoute([RoleEnum[0]]), getByIdRoadmap);


export default router;