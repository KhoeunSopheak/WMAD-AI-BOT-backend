import { Router } from "express";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { askQuery } from "../controllers/chat.controller";

const router = Router();

router.post("/askQuery", protectRoute([RoleEnum[0]]), askQuery);

export default router;