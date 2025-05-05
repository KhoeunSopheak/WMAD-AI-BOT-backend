import { Request, Response } from "express";
import { TeacherModel } from "../models/teacher.model";
import { v4 as uuidv4 } from "uuid";




export const createTeacher = async (req: Request, res: Response) => {
    const { teachercard_id, user_id, full_name, school, course } = req.body;
    const id = uuidv4();
    const created_at = new Date();
    const updated_at = new Date();

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
        res.status(201).json({ message: "Teacher register successfully"})  
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: "Interanl Server Error" });
        return;
    }
}

export const getAllTeacher = async (req: Request, res: Response) => {
        
    try {
        const teacher = await teacherModel.findById();
      
          if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
          }
      
          res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const getTeacherById = async (req: Request, res: Response) => {
        
    try {
        const { id } = req.params;
        const teacher = await TeacherModel.findById();
      
          if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
          }
      
          res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}