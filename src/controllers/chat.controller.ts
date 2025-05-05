import { Request, Response } from "express";
import ollama from 'ollama';
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { ChatModel } from "../models/chat.model";
import { v4 as uuidv4 } from "uuid";


export const askQuery = async (req: Request, res: Response) => {
  const { student_message, isStream = false } = req.body;
  const { student_id } = req.params;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!student_message || !student_id) {
    res.status(400).json({ message: "Query and student_id are required." });
    return;
  }

  try {
    if (isStream) {
      await ollamaStream([{ role: 'user', content: student_message }], res);
    } else {
      const response = await ollamaNoStream([{ role: 'user', content: student_message }]);

      const chatModel = new ChatModel({
        id,
        student_id, 
        student_message, 
        ai_message: response.message.content,
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

