import { Router } from "express";
import {
  createTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
} from "../controllers/teacher.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { validateTeacher } from "../midleware/validation.midleware";

const router = Router();

router.post("/", protectRoute([RoleEnum[0]]), validateTeacher, createTeacher);
router.get("/", protectRoute([RoleEnum[0]]), getAllTeachers);
router.get("/:id",protectRoute([RoleEnum[0]]), getTeacherById);
router.put("/:id",protectRoute([RoleEnum[0]]), validateTeacher, updateTeacher);
router.delete("/:id",protectRoute([RoleEnum[0]]), deleteTeacher);

export default router;
