import { Request, Response } from "express";
import { MilestoneModel } from "../models/milestone.model";

export const milestoneController = async (req: Request, res: Response) => {
    const { title } = req.body;

    if(!title){
        res.status(404).json({message: "Title not found."});
        return;
    }
    try{
        const roadmap_id =new MilestoneModel();
        console.log("==========================", roadmap_id.findByRoadmapId);

        res.status(200).json({message: "succes"});
        return;
    }catch(error){
        console.error("error", error);
        res.status(500).json({message: "Internal server not found."});
        return;
    }
}