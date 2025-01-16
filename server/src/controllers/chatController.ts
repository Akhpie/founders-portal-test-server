import { Request, Response } from "express";
import OpenAI from "openai";
import {
  MEETING_RELATED_PROMPTS,
  parseSchedulingRequest,
} from "../../handlers/meetingHandler";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration constants
const MAX_TOKENS = 4096;
const MAX_RESPONSE_TOKENS = 1024;
const SAFETY_BUFFER = 100;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const chatHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, conversationHistory = [] } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid or missing text",
      });
      return;
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://founders-portal-test-server-client.onrender.com"
    );

    // Check if it's a meeting scheduling request
    const isSchedulingRequest = MEETING_RELATED_PROMPTS.some((prompt) =>
      text.toLowerCase().includes(prompt.toLowerCase())
    );

    if (isSchedulingRequest) {
      try {
        const meetingDetails = await parseSchedulingRequest(text);
        res.write(
          `data: ${JSON.stringify({
            content:
              "I'll help you schedule a meeting. Please confirm the details:",
            meetingDetails,
            showScheduler: true,
          })}\n\n`
        );
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (error) {
        console.error("Error parsing meeting request:", error);
        // Continue with normal chat if meeting parsing fails
      }
    }

    // System message that guides AI behavior
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are an expert AI assistant specializing in startups, venture capital, and the investment ecosystem.

      When asked to provide lists or data about organizations, always format your response exactly like this:

      First provide a brief introduction like:
      "Here's a list of [X] [type] organizations, along with their official websites or important links:"

      Then create a numbered table with these exact columns:
      | No. | Organization Name | Website/Important Link |
      |-----|------------------|----------------------|
      | 1 | [Organization Name] | [Link Name](url) |

      Guidelines:
      - Always number entries sequentially starting from 1
      - Keep organization names clear and concise
      - Use descriptive link text instead of just "Website"
      - Ensure all links are properly formatted as markdown links [text](url)
      - If providing Indian organizations, prioritize .in domains where applicable`,
    };

    // Prepare messages array with system message and user input
    const messages: ChatMessage[] = [
      systemMessage,
      ...conversationHistory,
      { role: "user", content: text },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      stream: true,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      top_p: 1,
      n: 1,
      stop: null,
    });

    let totalTokens = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        totalTokens += content.split(" ").length;

        if (totalTokens >= MAX_RESPONSE_TOKENS - SAFETY_BUFFER) {
          res.write(
            `data: ${JSON.stringify({
              content: "\n\n[Response truncated due to length]",
            })}\n\n`
          );
          break;
        }

        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("AI chat error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({
        error: "Failed to get AI response",
        details: errorMessage,
      })}\n\n`
    );
    res.end();
  }
};

export { chatHandler };
