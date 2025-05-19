import { pool } from "../config/db";

export interface Chat {
  id: string;
  user_message: string;
  user_id: string;
  ai_response: string;
  category: string;
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
      INSERT INTO chats (id, user_message, user_id, ai_response, category, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      this.chat.id,
      this.chat.user_message,
      this.chat.user_id,
      this.chat.ai_response,
      this.chat.category,
      this.chat.created_at,
      this.chat.updated_at,
    ];

    await pool.query(query, values);
  }

  async updateChat(): Promise<void> {
    if (!this.chat) {
      throw new Error("Chat data is required to update a chat.");
    }

    // Step 1: Get existing chat data
    const existingChat = await this.findChatById(this.chat.id);

    if (!existingChat) {
      throw new Error(`Chat with ID ${this.chat.id} does not exist.`);
    }

    // Step 2: Append new content to existing values
    const updatedUserMessage = `${existingChat.user_message}\n${this.chat.user_message}`;
    const updatedAiResponse = `${existingChat.ai_response}\n${this.chat.ai_response}`;
    const updatedCategory = this.chat.category || existingChat.category;

    const updatedAt = new Date(); // Update timestamp

    // Step 3: Update the database
    const query = `
    UPDATE chats
    SET user_message = $1,
        ai_response = $2,
        category = $3,
        updated_at = $4
    WHERE id = $5
  `;

    const values = [
      updatedUserMessage,
      updatedAiResponse,
      updatedCategory,
      updatedAt,
      this.chat.id,
    ];

    await pool.query(query, values);
  }


  async findAllChats(): Promise<Chat[]> {
    const query = `SELECT * FROM chats ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async findChatById(id: string): Promise<Chat | null> {
    const query = `SELECT * FROM chats WHERE id = $1`;
    const result = await pool.query(query, [id]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }

  async findChatsByUser(user_id: string): Promise<Chat[]> {
    const query = `
      SELECT * FROM chats
      WHERE user_id = $1
      ORDER BY created_at ASC;
    `;

    const result = await pool.query(query, [user_id]);
    return result.rows as Chat[];
  }

  async deleteChat(id: string): Promise<void> {
    const query = `DELETE FROM chats WHERE id = $1`;
    await pool.query(query, [id]);
  }
}
