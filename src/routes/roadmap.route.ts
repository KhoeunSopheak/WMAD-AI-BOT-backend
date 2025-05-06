import { Router } from "express";
import { getRoadmapOptions,  } from "../controllers/roadmap.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";

const router = Router();

router.post("/generate-roadmap",protectRoute([RoleEnum[0]]), getRoadmapOptions);
// router.get("/",protectRoute([RoleEnum[0]]));
router.get("/:id", protectRoute([RoleEnum[0]]));


export default router;