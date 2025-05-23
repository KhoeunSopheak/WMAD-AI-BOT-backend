import { OllamaMessageType } from "../common/types/ollamaMessage";
import { Response } from "express";
import ollama from "ollama";
import { v4 as uuidv4 } from "uuid";
import { ChatModel } from "../models/chat.model";

interface StreamMeta {
  user_id: string;
  user_message: string;
  category: string;
  new_chat?: boolean;
  chat_id?: string; // for updates
  onChunk?: (chunk: string) => void;
  onEnd?: (chat_id: string) => void;
}

export const ollamaStream = async (
  messages: OllamaMessageType[],
  res?: Response,
  meta?: StreamMeta
): Promise<void> => {
  const id = meta?.new_chat ? uuidv4() : meta?.chat_id;
  const created_at = new Date();
  const updated_at = new Date();
  let fullResponse = "";

  try {
    const stream = await ollama.chat({
      model: "llama3.2",
      messages,
      stream: true,
    });

    // Send headers and initial JSON if streaming
    if (res) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Chat-Id", id ?? "");
      res.setHeader("Access-Control-Expose-Headers", "X-Chat-Id");
      // res.write(`data: ${JSON.stringify({ chat_id: id })}\n\n`);
    }

    for await (const chunk of stream) {
      const content = chunk.message?.content;
      if (content) {
        fullResponse += content;

        if (res) res.write(content);
        if (meta?.onChunk) meta.onChunk(content);
      }
    }

    // Save or update chat in DB
    // const chatModel = new ChatModel({
    //   id: id!,
    //   user_id: meta?.user_id || "",
    //   user_message: [meta?.user_message || ""],
    //   ai_response: [fullResponse],
    //   category: meta?.category || '',
    //   created_at,
    //   updated_at,
    // });


    // if (meta?.newChat) {
    //   await chatModel.startChat();
    // } else {
    //   await chatModel.updateChat();
    // }

    if (meta?.onEnd) {
      await meta.onEnd(id ?? "");
    }

    if (res && !res.writableEnded) {
      res.end();
    }
  } catch (error) {
    console.error("Streaming error:", error);
    if (res && !res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
      res.end();
    }
  }
};

export const ollamaNoStream = async (messages: OllamaMessageType[]) => {
  const response = await ollama.chat({
    model: "llama3.2",
    messages,
  });

  return response;
};
