import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const enhanceTextHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid or missing text",
      });
      return;
    }

    // Call OpenAI API for text enhancement
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional text enhancer. Improve the given text by making it more clear, concise, and professional. Correct grammar, improve word choice, and enhance overall readability.",
        },
        {
          role: "user",
          content: `Enhance the following text, maintaining its original meaning but improving its quality:\n\n${text}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Extract enhanced text
    const enhancedText = completion.choices[0].message.content?.trim() || text;

    // Respond with enhanced text
    res.status(200).json({
      success: true,
      enhancedText,
    });
  } catch (error) {
    console.error("Text enhancement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to enhance text",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export { enhanceTextHandler };
