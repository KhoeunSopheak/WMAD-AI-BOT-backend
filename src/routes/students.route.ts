import { Router } from "express";
import {
  create,
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllStudents,
} from "../controllers/students.controller";
import protectRoute from "../midleware/auth.midleware";
import { RoleEnum } from "../common";
import { validateStudent } from "../midleware/validation.midleware";

const router = Router();

router.post("/", protectRoute([RoleEnum[0]]), validateStudent, create);
router.get("/",protectRoute([RoleEnum[0]]), getAllStudents);
router.get("/:id",protectRoute([RoleEnum[0]]), getStudentById);
router.put("/:id",protectRoute([RoleEnum[0]]), validateStudent, updateStudent);
router.delete("/:id",protectRoute([RoleEnum[0]]), deleteStudent);

export default router;
