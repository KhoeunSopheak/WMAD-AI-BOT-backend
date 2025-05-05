import { pool } from "../config/db";


export interface Teacher {
    id: string;
    teachercard_id: number;
    user_id: string;
    full_name: string;
    school: string;
    course: string;
    created_at: Date;
    updated_at: Date | null;
}

export class TeacherModel {
    private teacher?: Teacher;

    constructor(teacher?: Teacher) {
        this.teacher = teacher;
    }

    async create(): Promise<void> {
        if (!this.teacher) {
            throw new Error("Teacher data is required");
        }

        const query = `
          INSERT INTO teachers (id, teachercard_id, user_id, full_name, school, course, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *;
        `;

        const values = [
            this.teacher.id,
            this.teacher.teachercard_id,
            this.teacher.user_id,
            this.teacher.full_name,
            this.teacher.school,
            this.teacher.course,
            this.teacher.created_at,
            this.teacher.updated_at
        ];

        await pool.query(query, values);
    }

    async findAll(): Promise<Teacher[]> {
        const query = `SELECT * FROM teachers ORDER BY created_at DESC`;
        const result = await pool.query(query);
        return result.rows;
      }
    
    async findById(id: string): Promise<Teacher | null> {
        const query = `SELECT * FROM teachers WHERE id = $1`;
        const result = await pool.query(query, [id]);
        const rows = result.rows;
        return rows.length > 0 ? rows[0] : null;    
    }

    async findByUserId(user_id: string): Promise<Teacher | null> {
        const query = `SELECT * FROM teachers WHERE id = $1`;
        const result = await pool.query(query, [user_id]);
        const rows = result.rows;
        return rows.length > 0 ? rows[0] : null;    
    }

  async update(): Promise<void> {
    if (!this.teacher) throw new Error("Teacher data is required");

    const query = `
      UPDATE teachers
      SET teachercard_id = $1,
          full_name = $2,
          school = $3,
          course = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [
      this.teacher.teachercard_id,
      this.teacher.full_name,
      this.teacher.school,
      this.teacher.course,
      this.teacher.id,
    ];

    await pool.query(query, values);
  }

  async delete(): Promise<void> {
    if (!this.teacher?.id) {
      throw new Error("Teacher ID is required to delete.");
    }

    const query = `DELETE FROM teachers WHERE id = $1`;
    await pool.query(query, [this.teacher.id]);
  }

}
