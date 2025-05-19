import { OllamaMessageType } from "../common/types/ollamaMessage";
import { Response } from "express";
import ollama from "ollama";
import { v4 as uuidv4 } from "uuid";
import { ChatModel } from "../models/chat.model";

interface StreamMeta {
  user_id: string;
  user_message: string;
  category: string;
}

export const ollamaStream = async (
  messages: OllamaMessageType[],
  res: Response,
  meta: StreamMeta
) => {
  try {
    // Start streaming the response to the client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Create stream
    const stream = await ollama.chat({
      model: "llama3.2",
      messages,
      stream: true,
    });

    const id = uuidv4();
    const created_at = new Date();
    const updated_at = new Date();
    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk.message?.content) {
        res.write(`${chunk.message.content}`);
        fullResponse += chunk.message.content;
      }
    }

    // Save chat to database
    const chatModel = new ChatModel({
      id,
      user_id: meta.user_id,
      user_message: meta.user_message,
      ai_response: fullResponse,
      category: meta.category,
      created_at,
      updated_at,
    });

    await chatModel.startChat();

    // Close the stream
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
};

export const ollamaNoStream = async (messages: OllamaMessageType[]) => {
  const response = await ollama.chat({
    model: "llama3.2",
    messages,
  });

  return response;
};
