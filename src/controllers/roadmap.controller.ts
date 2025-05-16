import { Request, Response } from "express";
import { ollamaNoStream } from "../service/ollamaChat";
import { RoadmapModel, MilestoneItem } from "../models/roadmap.model";
import { v4 as uuidv4 } from "uuid";

// Create a roadmap using AI
export const getRoadmapOptions = async (req: Request, res: Response) => {
    const { title } = req.body;
    const user_id = req.user?.id;

    if (!title) {
         res.status(400).json({ message: "Title is required." });
         return;
    }

    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User not authenticated." });
        return;
    }

    try {
        const prompt = `
Generate exactly 10 learning milestones for the topic "${title}".
Each milestone should start with its number in the title (e.g., "1. Introduction to ...").
Each milestone must include:
- A title (starting with the number)
- A short description of what the learner should achieve in this milestone.

Format the milestones as a numbered list using this format:
1. Milestone Title – Milestone detail
Do NOT include any introduction or conclusion — only the 10 milestones.
`;

        const aiResponse = await ollamaNoStream([{ role: "user", content: prompt }]);
        const aiText = aiResponse.message.content.trim();

        const milestones: MilestoneItem[] = aiText
            .split('\n')
            .map(line => {
                const match = line.match(/^(\d+)\.\s*(.+?)\s*[–-]\s*(.+)$/); // Match "1. Title – Detail"
                if (!match) return null;

                const number = match[1].trim();
                const rawTitle = match[2].trim();
                const detail = match[3].trim();

                return {
                    title: `${number}. ${rawTitle}`,
                    detail,
                };
            })
            .filter((m): m is MilestoneItem => m !== null);

        if (milestones.length !== 10) {
             res.status(400).json({ message: "AI did not return exactly 10 milestones." });
             return;
        }

        const created_at = new Date();
        const updated_at = new Date();

        const roadmapModel = new RoadmapModel({
            id: uuidv4(),
            user_id,
            title,
            milestone: milestones,
            created_at,
            updated_at,
        });

        await roadmapModel.createRoadmap();

         res.status(201).json({
            message: "Roadmap created successfully",
            roadmap: roadmapModel['roadmap'],
        });
        return;
    } catch (error) {
        console.error("Error generating roadmap:", error);
         res.status(500).json({ message: "Failed to generate and save roadmap." });
         return;
    }
};

// Get all roadmaps
export const getAllRoadmaps = async (_req: Request, res: Response) => {
    try {
        const roadmapModel = new RoadmapModel();
        const roadmaps = await roadmapModel.findAllRoadmap();

        res.status(200).json({ message: "Get all roadmap successfully", roadmaps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get roadmap by ID
export const getByIdRoadmap = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const roadmapModel = new RoadmapModel();
        const roadmap = await roadmapModel.findById(id);

        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found." });
            return;
        }

        res.status(200).json({ message: "Get Roadmap successfully", roadmap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all roadmaps by user ID
export const getRoadmapByUserId = async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        const roadmapModel = new RoadmapModel();
        const roadmaps = await roadmapModel.findByUserId(user_id);

        if (!roadmaps || roadmaps.length === 0) {
            res.status(404).json({ message: "Roadmap not found." });
            return;
        }

        res.status(200).json({ message: "Get Roadmap by user successfully", roadmaps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
