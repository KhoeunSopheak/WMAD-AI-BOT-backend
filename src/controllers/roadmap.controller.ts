import { Request, Response } from "express";
import { ollamaNoStream } from "../service/ollamaChat";
import { RoadmapModel } from "../models/roadmap.model";
import { v4 as uuidv4 } from "uuid";

export const getRoadmapOptions = async (req: Request, res: Response) => {
    const { title } = req.body;
    const user_id = req.user?.id;

    console.log('======>', user_id)

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
             Suggest a step-by-step milestone plan for learning the topic "${title}".
             List important concepts or skills to master, presented in order of learning.
             Give the milestones as a numbered list without explanations.
             Do not include any introductions or conclusions — only the milestones.
        `;

        const aiResponse = await ollamaNoStream([{ role: "user", content: prompt }]);

        console.log("AI Response:", aiResponse);

        const aiText = aiResponse.message.content.trim();

        console.log("aiText:", aiText);

        const roadmapTitles = aiText
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, "").trim())
            .filter(title => title.length > 0);

        console.log("======>", roadmapTitles);

        const created_at = new Date();
        const updated_at = new Date();

        const roadmapModel = new RoadmapModel({
            id: uuidv4(),
            user_id,
            title,
            milestone: roadmapTitles,
            created_at,
            updated_at,
        });

        console.log("<=======>", roadmapModel)

        await roadmapModel.createRoadmap();

        res.status(200).json({ roadmaps: roadmapModel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate and save roadmaps." });
    }
};

export const getByIdRoadmap = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log("Roadmap Id:", id);

    try {
        const roadmapModel = new RoadmapModel();
        const roadmap = await roadmapModel.findById(id);

        if (!roadmap) {
            res.status(404).json({ message: "Roadmap not found." });
            return;
        }

        res.status(200).json(roadmap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

};

export const getRoadmapByUserId = async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        const roadmapModel = new RoadmapModel();
        const userRoadmap = await roadmapModel.findByUserId(user_id);

        if (!userRoadmap) {
            res.status(404).json({ message: "Roadmap not found." });
            return;
        }

        res.status(200).json(userRoadmap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

