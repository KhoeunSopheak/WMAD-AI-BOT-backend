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

const router = Router();

router.post("/", protectRoute([RoleEnum[0]]), create); // 'user'
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
