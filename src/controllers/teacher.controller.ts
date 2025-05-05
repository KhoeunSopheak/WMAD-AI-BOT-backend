import { Request, Response } from "express";
import { TeacherModel } from "../models/teacher.model";
import { v4 as uuidv4 } from "uuid";


export const createTeacher = async (req: Request, res: Response) => {
    const { teachercard_id, full_name, school, course } = req.body;
    const id = uuidv4();
    const user_id = req.user?.id;
    const created_at = new Date();
    const updated_at = new Date();

    if (!user_id) {
        res.status(400).json({ message: "User ID is not found" });
        return;
      }

    try {
        const teacherModel = new TeacherModel({
            id,
            teachercard_id,
            user_id,
            full_name,
            school,
            course,
            created_at,
            updated_at,
        });

        await teacherModel.create();
        res.status(201).json({ message: "Teacher register successfully" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Interanl Server Error" });
        return;
    }
}

export const getAllTeachers = async (req: Request, res: Response) => {

    try {
        const teacherModel = new TeacherModel();
        const teacher = await teacherModel.findAll();

        if (!teacher) {
           res.status(404).json({ message: "Teacher not found" });
           return;
        }

        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const getTeacherById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const teacherModel = new TeacherModel();
        const teacher = await teacherModel.findById(id);

        if (!teacher) {
            res.status(404).json({ message: "Teacher not found" });
            return;
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const updateTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { teachercard_id, full_name, school, course } = req.body;

  try {
    const teacherModel = new TeacherModel({
      id,
      teachercard_id,
      user_id: "", // optional, not used in update
      full_name,
      school,
      course,
      created_at: new Date(), // unused
      updated_at: new Date(),
    });

    await teacherModel.update();
    res.status(200).json({ message: "Teacher updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const teacherModel = new TeacherModel({ id } as any);
    await teacherModel.delete();
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};