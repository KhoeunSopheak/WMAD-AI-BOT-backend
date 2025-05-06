import { Request, Response } from "express";
import { ollamaNoStream } from "../service/ollamaChat";
import { RoadmapModel } from "../models/roadmap.model";
import { v4 as uuidv4 } from "uuid";

export const getRoadmapOptions = async (req: Request, res: Response) => {
    const { title } = req.body;
    const user_id = req.user?.id;

    console.log('======>',user_id)

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
          Suggest 2 creative roadmap titles for the topic "${title}".
          Give only the titles as a numbered list without explanation.
        `;

        const aiResponse = await ollamaNoStream([{ role: "user", content: prompt }]);
        const aiText = aiResponse.message.content.trim();

        const roadmapTitles = aiText
          .split('\n')
          .map(line => line.replace(/^\d+\.\s*/, "").trim())
          .filter(title => title.length > 0);

        const created_at = new Date();
        const updated_at = new Date();

        const savedRoadmaps = [];

        for (const roadmapTitle of roadmapTitles) {
            const roadmapModel = new RoadmapModel({
                id: uuidv4(),
                user_id,
                title: roadmapTitle,
                created_at,
                updated_at,
            });

            const savedRoadmap = await roadmapModel.createRoadmap();
            savedRoadmaps.push(savedRoadmap);
        }

        res.status(200).json({ roadmaps: savedRoadmaps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate and save roadmaps." });
    }
};

export const getByIdRoadmap = async (req: Request, res: Response) => {
    const { id } = req.params;

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
