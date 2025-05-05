import { pool } from "../config/db";

export interface Student {
  id: string;
  studentcard_id: number;
  user_id: string;
  full_name: string;
  school: string;
  skill: string;
  created_at: Date;
  updated_at: Date | null;
}

export class StudentModel {
  private student?: Student;

  constructor(student?: Student) {
    this.student = student;
  }

  async create(): Promise<void> {
    if (!this.student) {
      throw new Error("Student data is required to register a student.");
    }

    const query = `
      INSERT INTO students (id, studentcard_id, user_id, full_name, school, skill, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      this.student.id,
      this.student.studentcard_id,
      this.student.user_id,
      this.student.full_name,
      this.student.school,
      this.student.skill,
      this.student.created_at,
      this.student.updated_at,
    ];

    await pool.query(query, values);
  }

  async getAll(): Promise<Student[]> {
    const query = `SELECT * FROM students ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }


  async findByUserId(user_id: string): Promise<Student | null> {
    const query = `SELECT * FROM students WHERE user_id = $1`;
    const result = await pool.query(query, [user_id]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }

  async findById(id: string): Promise<Student | null> {
    const query = `SELECT * FROM students WHERE id = $1`;
    const result = await pool.query(query, [id]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }

  async update(): Promise<void> {
    if (!this.student) {
      throw new Error("Student data is required to update.");
    }

    const query = `
      UPDATE students
      SET studentcard_id = $1,
          full_name = $2,
          school = $3,
          skill = $4,
          updated_at = $5
      WHERE id = $6
    `;

    const values = [
      this.student.studentcard_id,
      this.student.full_name,
      this.student.school,
      this.student.skill,
      new Date(),
      this.student.id,
    ];

    await pool.query(query, values);
  }

  async delete(): Promise<void> {
    if (!this.student?.id) {
      throw new Error("Student ID is required to delete.");
    }

    const query = `DELETE FROM students WHERE id = $1`;
    await pool.query(query, [this.student.id]);
  }
}
