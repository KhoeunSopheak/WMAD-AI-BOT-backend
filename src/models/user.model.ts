import { pool } from "../config/db";
import { comparePassword, encryptPassword } from "../utils/encrypt";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  password: string;
  created_at: Date;
  updated_at: Date | null;
}

export class UserModel {
  private user?: User;
  static user: any;

  constructor(user?: User) {
    this.user = user;
  }

  async register(): Promise<void> {
    if (!this.user) {
      throw new Error("User data is required to create a new user.");
    }

    const hashPassword = encryptPassword(this.user.password);

    const query = `
      INSERT INTO users (id, full_name, email, role, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      this.user.id,
      this.user.full_name,
      this.user.email,
      this.user.role,
      hashPassword,
      this.user.created_at,
      this.user.updated_at,
    ];

    await pool.query(query, values);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }

  async validateLogin(email: string, password: string): Promise<{ isValid: boolean, user?: User }> {
    const user = await this.findByEmail(email);

    if (!user) return { isValid: false };
    const isPasswordValid = await comparePassword(user.password, password);
    return { isValid: isPasswordValid, user: isPasswordValid ? user : undefined };
  }
}
