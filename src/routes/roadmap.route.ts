import { Router } from "express";
import { getAllRoadmaps, getByIdRoadmap, getRoadmapByUserId, getRoadmapOptions,  } from "../controllers/roadmap.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";

const router = Router();

router.post("/generate-roadmap",protectRoute([RoleEnum[0]]), getRoadmapOptions);
router.get("/", protectRoute([RoleEnum[0]]), getAllRoadmaps);
router.get("/:id", protectRoute([RoleEnum[0]]), getByIdRoadmap);
router.get("/chats/:user_id",protectRoute([RoleEnum[0]]), getRoadmapByUserId);



export default router;