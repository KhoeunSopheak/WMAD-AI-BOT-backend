import { pool } from "../config/db";

export interface Chat {
  id: string;
  student_message: string;
  ai_message: string;
  student_id: string;
  created_at: Date;
  updated_at: Date;
}

export class ChatModel {
  private chat?: Chat;

  constructor(chat?: Chat) {
    this.chat = chat;
  }

  async startChat(): Promise<void> {
    if (!this.chat) {
      throw new Error("Chat data is required to create a chat.");
    }

    const query = `
      INSERT INTO chats (id, student_message, ai_message, student_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      this.chat.id,
      this.chat.student_message,
      this.chat.ai_message,
      this.chat.student_id,
      this.chat.created_at,
      this.chat.updated_at,
    ];

    await pool.query(query, values);
  }

  static async getChatsByStudent(student_id: string): Promise<Chat[]> {
    const query = `
      SELECT * FROM chats
      WHERE student_id = $1
      ORDER BY created_at ASC;
    `;

    const result = await pool.query(query, [student_id]);
    return result.rows as Chat[];
  }
}
