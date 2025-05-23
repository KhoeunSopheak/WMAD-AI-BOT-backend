import { Request, Response } from "express";
import { StudentModel } from "../models/student.model";
import { v4 as uuidv4 } from "uuid";

export const create = async (req: Request, res: Response) => {
  const { studentcard_id, full_name, school, skill } = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  const user_id = req.user?.id;

  if (!user_id) {
    res.status(400).json({ message: "User ID is missing from token" });
    return;
  }

  try {
    const studentModel = new StudentModel({
      id,
      studentcard_id,
      user_id,
      full_name,
      school,
      skill,
      created_at,
      updated_at,
    });

    await studentModel.create();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllStudents = async (_req: Request, res: Response) => {
    try {
      const studentModel = new StudentModel();
      const students = await studentModel.getAll();
  
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const studentModel = new StudentModel();
    const student = await studentModel.findById(id);

    if (!student) {
     res.status(404).json({ message: "Student not found" });
     return;
    }

    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentcard_id, full_name, school, skill } = req.body;

  try {
    const studentModel = new StudentModel({
      id,
      studentcard_id,
      user_id: "", // optional, not used in update
      full_name,
      school,
      skill,
      created_at: new Date(), // unused
      updated_at: new Date(),
    });

    await studentModel.update();
    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const studentModel = new StudentModel({ id } as any);
    await studentModel.delete();
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateChat = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { user_message } = req.body;
//   const updated_at = new Date();

//   if (!user_message) {
//     res.status(400).json({ message: "user_message is required to update the chat." });
//      return;
//   }

//   try {
//     const chatModel = new ChatModel();
//     const existingChat = await chatModel.findChatById(id);

//     if (!existingChat) {
//       res.status(404).json({ message: "Chat not found." });
//        return;
//     }

//     // Join previous conversation
//     const historyPrompt = existingChat.user_message
//       .map((msg, i) => `User: ${msg}\nAI: ${existingChat.ai_response[i] || ""}`)
//       .join("\n");

//     const newPrompt = `${historyPrompt}\nUser: ${user_message}`;

//     let fullResponse = "";

//     // Stream the response
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
//         onEnd: async () => {
//           try {
//             const updatedChat = new ChatModel({
//               ...existingChat,
//               user_message: [...existingChat.user_message, user_message],
//               ai_response: [...existingChat.ai_response, fullResponse],
//               updated_at,
//             });

//             await updatedChat.updateChat();
//           } catch (err) {
//             console.error("Error saving chat after stream:", err);
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