import { Request, Response } from "express";
import { ollamaNoStream } from "../service/ollamaChat";
import { ChatModel } from "../models/chat.model";


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

export const updateChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_message } = req.body;
  const updated_at = new Date();

  if (!user_message) {
    res.status(400).json({ message: "user_message is required to update the chat." });
    return;
  }

  try {
    const chatModel = new ChatModel();
    const existingChat = await chatModel.findChatById(id);

    if (!existingChat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }

    // Compose the new prompt for AI
    const newPrompt = `${existingChat.user_message}\nUser: ${user_message}`;

    const response = await ollamaNoStream([{ role: 'user', content: newPrompt }]);
    const newAiResponse = response.message.content;

    // Create new ChatModel instance with updated chat history
    const updatedChat = new ChatModel({
      ...existingChat,
      user_message: `${existingChat.user_message}\n${user_message}`,
      ai_response: `${existingChat.ai_response}\n${newAiResponse}`,
      updated_at,
    });

    await updatedChat.updateChat();

    res.status(200).json({
      message: "Chat updated successfully.",
      new_ai_response: newAiResponse,
    });
    return;
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};



