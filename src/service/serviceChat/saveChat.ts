import { Request, Response } from "express";
import { ollamaNoStream, ollamaStream } from "../../service/ollamaChat";
import { ChatModel } from "../../models/chat.model";
import { v4 as uuidv4 } from "uuid";
import { BlockModel } from "../../models/block.model";
import { Filter } from 'bad-words';

export const askQuery = async (req: Request, res: Response) => {
  const { user_message, category, isStream = false } = req.body;
  const user_id = req.user?.id;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!user_message || !user_id) {
    res.status(400).json({ message: "Query is required." });
    return;
  }

  const selectedCategory = category || "General";
  let prompt = "";

  switch (selectedCategory) {
    case "Web mobile app development (WMAD)":
      prompt = `You are an expert in web and mobile app development (fullstack, backend, frontend, IT support, or mobile apps). Assist with: ${user_message}`;
      break;
    case "School of Business (SoB)":
      prompt = `You are a business professional (accounting, human resources, administration, marketing, finance, or general business). Provide advice on: ${user_message}`;
      break;
    case "Film School":
      prompt = `You are a specialist in film production (photography or video editing). Help with: ${user_message}`;
      break;
    case "School of Hospitality and tourism (SoHT)":
      prompt = `You are a hospitality and tourism expert (food production, lodging, service, front office, or housekeeping). Assist with: ${user_message}`;
      break;
    case "School of Mechanical (SoM)":
      prompt = `You are a mechanical technician (car, motorbike, or general mechanics). Support the user with: ${user_message}`;
      break;
    case "School of Contruction (SoC)":
      prompt = `You are a construction and maintenance expert (engineering, air conditioning, maintenance, or electrician work). Provide assistance on: ${user_message}`;
      break;
    case "General":
      prompt = `You are an assistant of WMAD GPT, helpful, knowledgeable, and clear like ChatGPT. Just provide the most accurate and helpful answer to this message: ${user_message}`;
      break;
    default:
      prompt = `You are a helpful assistant. Please answer the user's question: ${user_message}`;
      break;
  }

  const filter = new Filter();
  const isProfane = filter.isProfane(user_message);

  if (isProfane) {
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
      // STREAM response and save inside ollamaStream
      await ollamaStream(
        [{ role: "user", content: prompt }],
        res,
        {
          user_id,
          user_message,
          category: selectedCategory,
        }
      );
    } else {
      // NO STREAM (return full response directly)
      const response = await ollamaNoStream([{ role: "user", content: prompt }]);
      const chatModel = new ChatModel({
        id,
        user_message,
        user_id,
        ai_response: [response.message.content],
        category: selectedCategory,
        created_at,
        updated_at,
      });

      await chatModel.startChat();
      res.status(200).json({ response: response.message.content });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
