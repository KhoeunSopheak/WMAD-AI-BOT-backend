import { pool } from "../config/db";

export interface Quiz {
  user_id: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: string;
  created_at: Date;
  updated_at: Date | null;
}

export class QuizModel {
  private quiz?: Partial<Quiz>;

  constructor(quiz?: Partial<Quiz>) {
    this.quiz = quiz;
  }

  // Create a new quiz question
  async create(quizData: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz> {
    const quiz: Quiz = {
      ...quizData,
      created_at: new Date(),
      updated_at: null,
    };

    const query = `
      INSERT INTO quizzes 
        ( user_id, topic, question, options, correct_answer, created_at, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      quiz.user_id,
      quiz.topic,
      quiz.question,
      JSON.stringify(quiz.options),
      quiz.correct_answer,
      quiz.created_at,
      quiz.updated_at,
    ];

    const result = await pool.query(query, values);
    const createdQuiz = result.rows[0];
    console.log("------------ query", createdQuiz.options)
    return {
      ...createdQuiz,
      options: createdQuiz.options,
    };
  }

  async getAll(): Promise<Quiz[]> {
    const query = `SELECT * FROM quizzes ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows.map((row: any) => ({
      ...row,
      options:row.options,
    }));
  }

  async findById(id: string): Promise<Quiz | null> {
    const query = `SELECT * FROM quizzes WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      options:row.options,
    };
  }

  async findByUserId(userId: string): Promise<Quiz[]> {
    const query = `SELECT * FROM quizzes WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row: any) => ({
      ...row,
      options:row.options,
    }));
  }
}
