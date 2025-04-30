import { OllamaMessageType } from "../common/types/ollamaMessage";
import { Request, Response } from "express";
import ollama from 'ollama';


export const ollamaStream = async (messages: OllamaMessageType[], res: Response) => {
    // Start streaming the response to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream data from Ollama
    const stream = await ollama.chat({
        model: 'llama3.2',
        messages,
        stream: true
    });

    for await (const chunk of stream) {
        if (chunk.message && chunk.message.content) {
            // Send each chunk of the response as an eventn
            res.write(chunk.message.content);
        }
    }
    // Close the stream once finished
    res.end();
}


export const ollamaNoStream = async (messages: OllamaMessageType[]) => {
    const response = await ollama.chat({
        model: 'llama3.2',
        messages,
    });

    return response
}