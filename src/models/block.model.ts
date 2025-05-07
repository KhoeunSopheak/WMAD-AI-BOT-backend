import { pool } from "../config/db";

export interface Block {
  id: string;
  user_id: string;
  user_message: string;
  created_at: Date;
  updated_at: Date | null;
}

export class BlockModel {
  private block?: Block;

  constructor(block?: Block) {
    this.block = block;
  }

  async blockUser(): Promise<void> {
    if (!this.block) {
      throw new Error("User data is required to create a new block.");
    }

    const query = `
      INSERT INTO blocks (id, user_id, user_message, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      this.block.id,
      this.block.user_id,
      this.block.user_message,
      this.block.created_at,
      this.block.updated_at,
    ];

    await pool.query(query, values);
  }

  async findBlockByUser(user_id: string): Promise<Block | null> {
    const query = `SELECT * FROM blocks WHERE user_id = $1`;
    const result = await pool.query(query, [user_id]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }
}
