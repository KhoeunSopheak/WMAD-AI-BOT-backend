import { Router } from "express";
import { getAllQuizzes, getByIdQuizzes, quizController, } from "../controllers/quizzes.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";

const router = Router();

router.post("/generate-quiz",protectRoute([RoleEnum[0], RoleEnum[1]]), quizController);
router.get("/",protectRoute([RoleEnum[0], RoleEnum[1]]), getAllQuizzes);
router.get("/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), getByIdQuizzes);


export default router;