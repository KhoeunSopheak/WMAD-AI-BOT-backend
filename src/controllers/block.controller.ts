import { Request, Response } from "express";
import { BlockModel } from "../models/block.model";


export const getBlockByUserId = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
      const blcokModel = new BlockModel();
      const blcok = await blcokModel.findBlockByUser(user_id);
  
      if (!blcok) {
        res.status(404).json({ message: "Block not found." });
        return;
      }
  
      res.status(200).json({ message: "Get blocks successfully", blcok });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  export const getAllBlocks = async (req: Request, res: Response) => {
    try {
      const blockModel = new BlockModel();
      const blocks = await blockModel.findAllBlocks();
  
      res.status(200).json({message: "Get all blocks successfully", blocks});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  export const getBlockById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const blockModel = new BlockModel();
      const blocks = await blockModel.findBlockById(id);
  
      res.status(200).json({message: "Get block successfully", blocks});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  export const deleteBlock = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const blockModel = new BlockModel();
      const blocks = await blockModel.deleteBlock(id);
  
      res.status(200).json({message: "Deleted block successfully", blocks});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }