import { Request, Response } from "express";
import { QuizModel } from "../models/quizzes.model";
import { ollamaNoStream } from "../service/ollamaChat";

export const quizController = async (req: Request, res: Response) => {
    const { topic } = req.body;

    if (!topic) {
        res.status(400).json({ message: "Topic is required." });
        return;
    }

    try {
        const user_id = req.user?.id;

        if (!user_id) {
            res.status(401).json({ message: "Unauthorized: User not authenticated." });
            return;
        }

        const query = `
You are a helpful coding assistant. I want you to create a exercise quizzes in the form of an array of objects. Each object should contain 3 properties: 
        
'question': the question base on topic of user input.
'options': 5 options, 4 incorrect answer and for correct answer.
'correctAnswer': the correction answer.

        Your response only be in this format without any other text outside of array:
        [
        {
            "question": "question 1",
            "options": ["option 1", "option 2", "option 3", "option 4", "option 5"] 
            "correctAnswer": "correct option"
        },
        ]

        Now, create a ${topic} quizzes.`


        const response = await ollamaNoStream([{ role: 'user', content: query }]);
        const rawText = response.message.content;
        console.log("AI Response:", rawText);

        // Use regex to find the JSON array inside the response text
        const jsonMatch = rawText.match(/\[\s*(?:\{[\s\S]*?\},?\s*)+\]/);
        console.log("==============", jsonMatch)

        if (!jsonMatch) {
            res.status(500).json({ message: "Failed to extract JSON array from AI response." });
            return;
        }
        console.log("-----------------------1")
        let quizArray;
        try {
            quizArray = JSON.parse(rawText);
        } catch (err) {
            res.status(500).json({ message: "AI response contains invalid JSON format." });
            return;
        }

        console.log(quizArray, "=========================================");


        const savedQuizzes = [];
        const quizModel = new QuizModel();

        for (const item of quizArray) {
            console.log("--------- ", item)
            console.log("=========", item.question)
            const quizData = {
                user_id,
                topic,
                question: item.question,
                options: item.options,
                correct_answer: item.correctAnswer,
            };

            const savedQuiz = await quizModel.create(quizData);
            savedQuizzes.push(savedQuiz);
        }

        res.status(201).json({
            message: "Quizzes created successfully",
            count: savedQuizzes.length,
            quizzes: savedQuizzes,
        });
        return;
    } catch (error) {
        console.error("Error in quizController:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const getAllQuizzes = async (_req: Request, res: Response) => {
    try {
        const studentModel = new QuizModel();
        const students = await studentModel.getAll();

        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getByIdQuizzes = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const quizModel = new QuizModel();
        const quiz = await quizModel.findById(id);

        if (!quiz) {
            res.status(404).json({ message: "Quiz not found." });
            return;
        }

        res.status(200).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}