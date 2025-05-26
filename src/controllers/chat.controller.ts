import { Request, Response } from "express";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { ChatModel } from "../models/chat.model";
import { v4 as uuidv4 } from "uuid";
import { Filter } from "bad-words";
import { BlockModel } from "../models/block.model";

export const getChatByUserId = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      res.status(400).json({ message: "Missing user_id in request params." });
      return;
    }

    const chatModel = new ChatModel();
    const chats = await chatModel.findChatsByUser(user_id);

    if (chats.length === 0) {
      res.status(404).json({ message: "No chats found for this user." });
      return;
    }

    res.status(200).json({
      message: "Chats retrieved successfully.",
      data: chats,
    });
    return;
  } catch (error) {
    console.error("Error retrieving chats:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const getAllChats = async (_req: Request, res: Response) => {
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.findAllChats();

    res.status(200).json({ message: "Get all chats successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const chatModel = new ChatModel();
    const chat = await chatModel.findChatById(id);

    if (!chat) {
      res.status(404).json({ message: "Chat not found." });
      return;
    }

    res.status(200).json({ message: "Get chat successfully", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const chatModel = new ChatModel();
    await chatModel.deleteChat(id);

    res.status(200).json({ message: "Deleted chat successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateChat = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { user_message } = req.body;
//   const uesrId = req.user?.id;

//   if (!user_message) {
//     res.status(400).json({ message: "user_message is required to update the chat." });
//     return;
//   }

//   try {
//     const chatModel = new ChatModel();
//     const existingChat = await chatModel.findChatById(id);

//     if (!existingChat) {
//       res.status(404).json({ message: "Chat not found." });
//       return;
//     }

//     const historyPrompt = existingChat.user_message
//       .map((msg, i) => `User: ${msg}\nAI: ${existingChat.ai_response[i] || ""}`)
//       .join("\n");

//     const newPrompt = `${historyPrompt}\nUser: ${user_message}`;
//     let fullResponse = "";

//     await ollamaStream(
//       [{ role: "user", content: newPrompt }],
//       res,
//       {
//         user_id: existingChat.user_id,
//         user_message,
//         category: existingChat.category,
//         onChunk: (chunk: string) => {
//           fullResponse += chunk;
//         },
//         onEnd: async (chat_id) => {
//           try {
//             // Append and trim to last 5 messages
//             const updatedUserMessages = [
//               ...(existingChat.user_message || []),
//               user_message,
//             ];

//             const updatedAiResponses = [
//               ...(existingChat.ai_response || []),
//               fullResponse,
//             ];

//             const updatedChat = new ChatModel({
//               ...existingChat,
//               user_message: updatedUserMessages,
//               ai_response: updatedAiResponses,
//               updated_at: new Date(),
//             });

//             await updatedChat.updateChat();

//             if (res && !res.headersSent && !res.writableEnded) {
//               res.write(`\ndata: ${JSON.stringify({
//                 message: "Chat updated successfully.",
//                 new_ai_response: fullResponse,
//               })}\n\n`);
//               res.end();
//             }
//           } catch (err) {
//             console.error("Error saving chat after stream:", err);
//             if (res && !res.headersSent) {
//               res.status(500).json({ message: "Failed to save chat update." });
//             }
//           }
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Error updating chat:", error);
//     if (!res.headersSent) {
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// };

export const updateChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_message } = req.body;

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

    // Step 1: Get last 5 messages
    const lastUserMessages = (existingChat.user_message || []).slice(-5);
    const lastAiResponses = (existingChat.ai_response || []).slice(-5);

    // Step 2: Build newPrompt from last 5 + new user input
    const historyPrompt = lastUserMessages
      .map((msg, i) => `User: ${msg}\nAI: ${lastAiResponses[i] || ""}`)
      .join("\n");

    const newPrompt = `${historyPrompt}\nUser: ${user_message}`;

    let fullResponse = "";

    // Step 3: Stream AI response
    await ollamaStream(
      [{ role: "user", content: newPrompt }],
      res,
      {
        user_id: existingChat.user_id,
        user_message,
        category: existingChat.category,
        onChunk: (chunk: string) => {
          fullResponse += chunk;
        },
        onEnd: async () => {
          try {
            // Step 4: Append new message and response to DB
            const updatedChat = new ChatModel({
              ...existingChat,
              user_message: [...(existingChat.user_message || []), user_message],
              ai_response: [...(existingChat.ai_response || []), fullResponse],
              updated_at: new Date(),
            });

            await updatedChat.updateChat();
          } catch (err) {
            console.error("Error saving chat after stream:", err);
            if (res && !res.headersSent) {
              res.status(500).json({ message: "Failed to save chat update." });
            }
          }
        }
      }
    );
  } catch (error) {
    console.error("Error updating chat:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};




export const generateAi = async (req: Request, res: Response) => {
  const { user_message, category, chat_id, isStream = false } = req.body;
  const user_id = req.user?.id;
  const created_at = new Date();
  const updated_at = new Date();

  if (!user_message || !user_id) {
    res.status(400).json({ message: "Query is required." });
    return;
  }

  const selectedCategory = category || "General";
  const promptMap: Record<string, string> = {
    "Web mobile app development (WMAD)": `You are an expert in web and mobile app development. Assist with: `,
    "School of Business (SoB)": `You are a business professional. Provide advice on: `,
    "Film School": `You are a specialist in film production. Help with: `,
    "School of Hospitality and tourism (SoHT)": `You are a hospitality expert. Assist with: `,
    "School of Mechanical (SoM)": `You are a mechanical technician. Support the user with: `,
    "School of Contruction (SoC)": `You are a construction expert. Provide assistance on: `,
  };
  const prompt = (promptMap[selectedCategory] || `You are a helpful assistant. Please answer: `) + user_message;

  const filter = new Filter();
  if (filter.isProfane(user_message)) {
    const blocksModel = new BlockModel({
      id: uuidv4(),
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
    const chatModel = new ChatModel();
    const existingChat = chat_id ? await chatModel.findChatById(chat_id) : null;

    let fullResponse = "";

    await ollamaStream(
      [{ role: "user", content: prompt }],
      res,
      {
        user_id,
        user_message,
        category: selectedCategory,
        chat_id: existingChat?.id,
        new_chat: !existingChat,
        onChunk: (chunk: string) => {
          fullResponse += chunk;
        },
        onEnd: async (id) => {
          console.log("------------- ", [(existingChat?.user_message ?? []), user_message])
          const chatData = {
            id: id,
            user_id,
            user_message: existingChat
              ? [...(existingChat.user_message || []), user_message]
              : [user_message],
            ai_response: existingChat
              ? [...(existingChat.ai_response || []), fullResponse]
              : [fullResponse],
            category: selectedCategory,
            created_at: existingChat?.created_at || created_at,
            updated_at: new Date(),
          };

          const chatToSave = new ChatModel(chatData);
          if (existingChat) {
            await chatToSave.updateChat();
          } else {
            await chatToSave.startChat();
          }
          console.log("✅ Chat saved successfully");
        },
      }
    );

  } catch (error) {
    console.error("Chat handler error:", error);
    res.status(500).json({ message: "Internal Server Error." });
    return;
  }
};

