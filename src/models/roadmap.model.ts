import { pool } from "../config/db";

// Define the shape of each milestone item
export interface MilestoneItem {
    title: string;
    detail: string;
}

// Define the roadmap structure
export interface Roadmap {
    id: string;
    user_id: string;
    title: string;
    milestone: MilestoneItem[];
    created_at: Date;
    updated_at: Date | null;
}

// Helper: Type guard to ensure milestone is valid
function isMilestoneItemArray(input: any): input is MilestoneItem[] {
    return Array.isArray(input) && input.every(
        item =>
            typeof item === 'object' &&
            typeof item.title === 'string' &&
            typeof item.detail === 'string'
    );
}

export class RoadmapModel {
    private roadmap?: Roadmap;

    constructor(roadmap?: Roadmap) {
        this.roadmap = roadmap;
    }

    // Create a new roadmap
    async createRoadmap(): Promise<void> {
        if (!this.roadmap) {
            throw new Error('Roadmap data is missing.');
        }

        const { id, user_id, title, milestone, created_at, updated_at } = this.roadmap;

        // Validate milestone before stringifying
        if (!isMilestoneItemArray(milestone)) {
            console.error("Invalid milestone format:", milestone);
            throw new Error("Invalid milestone format. Must be an array of { title, detail }.");
        }

        try {
            const query = `
                INSERT INTO roadmaps (id, user_id, title, milestone, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

            const milestoneJson = JSON.stringify(milestone); // Safely stringify
            const values = [id, user_id, title, milestoneJson, created_at, updated_at];

            await pool.query(query, values);
        } catch (error) {
            console.error("Failed to create roadmap:", error);
            throw error;
        }
    }

    // Get all roadmaps
    async findAllRoadmap(): Promise<Roadmap[]> {
        const query = `SELECT * FROM roadmaps ORDER BY created_at DESC`;
        const result = await pool.query(query);

        return result.rows.map(row => ({
            ...row,
            milestone:row.milestone,
        }));
    }

    // Get roadmap by ID
    async findById(id: string): Promise<Roadmap | null> {
        const query = `SELECT * FROM roadmaps WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];

        return {
            ...row,
            milestone: JSON.parse(row.milestone),
        };
    }

    // Get all roadmaps for a specific user
    async findByUserId(user_id: string): Promise<Roadmap[]> {
        const query = `SELECT * FROM roadmaps WHERE user_id = $1`;
        const { rows } = await pool.query(query, [user_id]);
      
        return rows.map(row => {
          let milestoneArray = [];
          try {
            milestoneArray = typeof row.milestone === "string" ? JSON.parse(row.milestone) : [];
          } catch (err) {
            console.warn("JSON parse error for milestone:", row.milestone);
          }
      
          return {
            ...row,
            milestone: milestoneArray,
          };
        });
      }
      

    async deleteRoadmap(id: string): Promise<void> {
        const query = `DELETE FROM roadmaps WHERE id = $1`;
        await pool.query(query, [id]);
      }
}
