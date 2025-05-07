import { pool } from "../config/db";

export interface Roadmap {
    id: string;
    user_id: string;
    title: string;
    milestone: string[];
    created_at: Date;
    updated_at: Date | null;
}

export class RoadmapModel {
    private roadmap?: Roadmap;

    constructor(roadmap?: Roadmap) {
        this.roadmap = roadmap;
    }

    async createRoadmap(): Promise<void> {
        if (!this.roadmap) {
            throw new Error('Roadmap data is missing.');
        }
        const { id, user_id, title, milestone, created_at, updated_at } = this.roadmap;

        const query = `
            INSERT INTO roadmaps (id, user_id, title, milestone, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const values = [id, user_id, title, JSON.stringify(milestone), created_at, updated_at];

         await pool.query(query, values);
    }

    async findById(id: string): Promise<Roadmap | null> {
        const query = `
            SELECT * FROM roadmaps WHERE id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0] as Roadmap;
    }

    async findByUserId(user_id: string): Promise<Roadmap[]> {
        const query = `
            SELECT * FROM roadmaps WHERE user_id = $1
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows as Roadmap[];
    }

    async findByTitle(title: string): Promise<Roadmap | null> {
        const query = `SELECT * FROM roadmaps WHERE title = $1 LIMIT 1`;
        const result = await pool.query(query, [title]);
        return result.rows[0] ?? null;
      }
      
}
