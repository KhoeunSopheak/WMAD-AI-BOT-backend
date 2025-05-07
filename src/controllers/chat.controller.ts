import { Request, Response } from "express";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { ChatModel } from "../models/chat.model";
import { v4 as uuidv4 } from "uuid";
import { BlockModel } from "../models/block.model";
import Filter from 'bad-words';


export const askQuery = async (req: Request, res: Response) => {
  const { user_message, isStream = false } = req.body;
  const user_id = req.user?.id;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!user_message || !user_id) {
    res.status(400).json({ message: "Query are required." });
    return;
  }

  const filter = new Filter();
  const hasBadWord = filter.isProfane(user_message);

  if (hasBadWord) {
    const blocksModel = new BlockModel({
      id,
      user_id,
      user_message,
      created_at,
      updated_at,
    });
    await blocksModel.blockUser();
    
    res.status(403).json({ message: "You have been blocked due to inappropriate language." });
    return;
  }

  try {
    if (isStream) {
      await ollamaStream([{ role: 'user', content: user_message }], res);
    } else {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const response = await ollamaNoStream([{ role: 'user', content: user_message }]);

      const words = response.message.content.split(" ");
      let currentText = "";

      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + " ";
        res.write(`data: ${JSON.stringify({ message: currentText.trim() })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      const chatModel = new ChatModel({
        id,
        user_message,
        user_id,
        ai_response: response.message.content,
        created_at,
        updated_at,
      });

      await chatModel.startChat();
      res.status(200).json({ response: response.message.content });
    }
  } catch (error) {
    console.error(error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
};

export const getChatByUserId = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.findChatsByUser(user_id);

    if (!chat) {
      res.status(404).json({ message: "Chats not found." });
      return;
    }

    res.status(200).json({message: "Get chats successfully", chat});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getBlockByUserId = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const blcokModel = new BlockModel();
    const blcok = await blcokModel.findBlockByUser(user_id);

    if (!blcok) {
      res.status(404).json({ message: "Block not found." });
      return;
    }

    res.status(200).json({message: "Get blocks successfully", blcok});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }


}

