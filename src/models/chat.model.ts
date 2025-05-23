import { pool } from "../config/db";

export interface Chat {
  id: string;
  user_message: string[];
  user_id: string;
  ai_response: string[];
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSummary {
  id: string;
  user_message: string[];
  user_id: string;
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

    const existingChat = await this.findChatById(this.chat.id);
    if (!existingChat) {
      throw new Error(`Chat with ID ${this.chat.id} does not exist.`);
    }

    // const updatedUserMessage = [...(existingChat.user_message || []), ...this.chat.user_message];
    // const updatedAiResponse = [...(existingChat.ai_response || []), ...this.chat.ai_response];
    const updatedCategory = this.chat.category || existingChat.category;
    const updatedAt = new Date();

    const query = `
      UPDATE chats
      SET user_message = $1,
          ai_response = $2,
          category = $3,
          updated_at = $4
      WHERE id = $5
    `;

    const values = [
      this.chat.user_message,
      this.chat.ai_response,
      updatedCategory,
      updatedAt,
      this.chat.id,
    ];

    try {
      await pool.query(query, values);
    } catch (error) {
      console.error('Failed to update chat:', error);
      throw new Error('Database update failed.');
    }
  }

  async findAllChats(): Promise<Chat[]> {
    const query = `SELECT * FROM chats ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async findChatById(id: string): Promise<Chat | null> {
    const query = `SELECT * FROM chats WHERE id = $1`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error("Error fetching chat by ID:", error);
      throw new Error("Database query failed.");
    }
  }

  async findChatsByUser(user_id: string): Promise<ChatSummary[]> {
    const query = `
      SELECT id, user_message, user_id, created_at, updated_at
      FROM chats
      WHERE user_id = $1
      ORDER BY created_at ASC;
    `;

    try {
      const result = await pool.query<ChatSummary>(query, [user_id]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching chats by user:", error);
      throw new Error("Database query failed.");
    }
  }

  async deleteChat(id: string): Promise<void> {
    const query = `DELETE FROM chats WHERE id = $1`;
    await pool.query(query, [id]);
  }

  async findLastChatByUserAndCategory(user_id: string, category: string): Promise<Chat | null> {
    const query = `
      SELECT * FROM chats
      WHERE user_id = $1 AND category = $2
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    try {
      const result = await pool.query<Chat>(query, [user_id, category]);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error("Error fetching chat by user and category:", error);
      throw new Error("Database query failed.");
    }
  }
}
