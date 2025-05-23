import { Router } from "express";
import { deleteQuiz, getAllQuizzes, getByIdQuizzes, getQuizByUserId, quizController, } from "../controllers/quizzes.controller";
import protectRoute, { blockIfDisabled } from "../midleware/auth.midleware";
import { RoleEnum } from "../common";

const router = Router();

router.post("/generate-quiz",protectRoute([RoleEnum[0], RoleEnum[1]]), blockIfDisabled, quizController);
router.get("/",protectRoute([RoleEnum[0], RoleEnum[1]]), getAllQuizzes);
router.get("/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), getByIdQuizzes);
router.get("/generate/:user_id", protectRoute([RoleEnum[0], RoleEnum[1]]), getQuizByUserId);
router.delete("/:id", protectRoute([RoleEnum[0], RoleEnum[1]]), deleteQuiz);


export default router;