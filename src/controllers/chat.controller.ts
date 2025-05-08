import { Request, Response } from "express";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { ChatModel } from "../models/chat.model";
import { v4 as uuidv4 } from "uuid";
import { BlockModel } from "../models/block.model";
import Filter from 'bad-words';


export const askQuery = async (req: Request, res: Response) => {
  const { user_message, category, isStream = false } = req.body;
  const user_id = req.user?.id;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!user_message || !user_id) {
    res.status(400).json({ message: "Query are required." });
    return;
  }

  const selectedCategory = category || "General";

  let prompt = "";

  switch (selectedCategory) {
    case "WMAD":
      prompt = `You are an expert in web and mobile app development (fullstack, backend, frontend, IT support, or mobile apps). Assist with: ${user_message}`;
      break;

    case "SoB":
      prompt = `You are a business professional (accounting, human resources, administration, marketing, finance, or general business). Provide advice on: ${user_message}`;
      break;

    case "Film":
      prompt = `You are a specialist in film production (photography or video editing). Help with: ${user_message}`;
      break;

    case "SoHT":
      prompt = `You are a hospitality and tourism expert (food production, lodging, service, front office, or housekeeping). Assist with: ${user_message}`;
      break;

    case "SoM":
      prompt = `You are a mechanical technician (car, motorbike, or general mechanics). Support the user with: ${user_message}`;
      break;

    case "SoC":
      prompt = `You are a construction and maintenance expert (engineering, air conditioning, maintenance, or electrician work). Provide assistance on: ${user_message}`;
      break;

    // Academic Subjects
    case "Mathematics":
      prompt = `You are a mathematics professor. Help solve or explain: ${user_message}`;
      break;

    case "Khmer":
      prompt = `You are a Khmer language teacher. Assist with understanding or translation: ${user_message}`;
      break;

    case "Physics":
      prompt = `You are a physics expert. Provide scientific explanations or solutions: ${user_message}`;
      break;

    case "Chemistry":
      prompt = `You are a chemistry teacher. Explain or solve chemistry problems: ${user_message}`;
      break;

    case "Art":
      prompt = `You are an art instructor. Give creative advice and guidance: ${user_message}`;
      break;

    case "English":
      prompt = `You are an English teacher. Assist with grammar, writing, or communication skills: ${user_message}`;
      break;

    // Default
    case "General":
    default:
      prompt = `You are a helpful assistant. Please answer the user's question: ${user_message}`;
      break;
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
      await ollamaStream([{ role: 'user', content: prompt }], res);
    } else {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const response = await ollamaNoStream([{ role: 'user', content: prompt }]);

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
        category: selectedCategory,
        created_at,
        updated_at,
      });

      console.log("======>", chatModel);

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

    res.status(200).json({ message: "Get chats successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.findAllChats();

    res.status(200).json({ message: "Get all chats successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}

export const getChatById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.findChatById(id);

    res.status(200).json({ message: "Get chat successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}

export const deleteChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.deleteChat(id);

    res.status(200).json({ message: "Deleted chat successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}


