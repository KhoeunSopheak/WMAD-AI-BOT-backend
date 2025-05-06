import { pool } from "../config/db";

export interface Milestone {
  id?: string; 
  title: string;
  description: string;
  roadmap_id: string; 
  created_at: Date;
  updated_at: Date | null;
}

export class MilestoneModel {
  private milestone?: Partial<Milestone>;

  constructor(milestone?: Partial<Milestone>) {
    this.milestone = milestone;
  }

  // Create a new milestone
  async create(data: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
    const milestone: Milestone = {
      ...data,
      created_at: new Date(),
      updated_at: null,
    };

    const query = `
      INSERT INTO milestones 
        (title, description, roadmap_id, created_at, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      milestone.title,
      milestone.description,
      milestone.roadmap_id,
      milestone.created_at,
      milestone.updated_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all milestones
  async getAll(): Promise<Milestone[]> {
    const query = `SELECT * FROM milestones ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Find milestone by its UUID
  async findById(id: string): Promise<Milestone | null> {
    const query = `SELECT * FROM milestones WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  }

  // Find all milestones by roadmap_id
  async findByRoadmapId(roadmapId: string): Promise<Milestone[]> {
    const query = `SELECT * FROM milestones WHERE roadmap_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [roadmapId]);
    return result.rows;
  }

  // Update a milestone
  async update(id: string, updates: Partial<Milestone>): Promise<Milestone | null> {
    const query = `
      UPDATE milestones
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        roadmap_id = COALESCE($3, roadmap_id),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const values = [
      updates.title ?? null,
      updates.description ?? null,
      updates.roadmap_id ?? null,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  }
}
