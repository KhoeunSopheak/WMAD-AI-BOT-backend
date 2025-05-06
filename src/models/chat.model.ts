import { pool } from "../config/db";

export interface Chat {
  id: string;
  user_message: string;
  user_id: string;
  ai_response: string;
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
      INSERT INTO chats (id, user_message, user_id, ai_response, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      this.chat.id,
      this.chat.user_message,
      this.chat.user_id,
      this.chat.ai_response,
      this.chat.created_at,
      this.chat.updated_at,
    ];

    await pool.query(query, values);
  }

  static async getChatsByUser(user_id: string): Promise<Chat[]> {
    const query = `
      SELECT * FROM chats
      WHERE user_id = $1
      ORDER BY created_at ASC;
    `;

    const result = await pool.query(query, [user_id]);
    return result.rows as Chat[];
  }
}
