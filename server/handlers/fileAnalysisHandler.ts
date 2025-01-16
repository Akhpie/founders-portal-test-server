import type { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import mammoth from "mammoth";

// Interfaces
interface ExcelData {
  chunks: string[];
  summary: string;
}

// Constants
const MAX_CHUNK_SIZE = 4000;
const MAX_SUMMARY_LENGTH = 1000;

const MAX_TOKENS_PER_REQUEST = 6000; // Safe limit for GPT-4
const CHARS_PER_TOKEN = 4; // Approximate characters per token
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_REQUEST * CHARS_PER_TOKEN;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const chunkContent = (content: string): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";
  const paragraphs = content.split("\n");

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > MAX_CHARS_PER_CHUNK) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      // If a single paragraph is too long, split it
      if (paragraph.length > MAX_CHARS_PER_CHUNK) {
        const words = paragraph.split(" ");
        let tempChunk = "";
        for (const word of words) {
          if (tempChunk.length + word.length + 1 > MAX_CHARS_PER_CHUNK) {
            chunks.push(tempChunk.trim());
            tempChunk = "";
          }
          tempChunk += (tempChunk ? " " : "") + word;
        }
        if (tempChunk) {
          currentChunk = tempChunk;
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? "\n" : "") + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = /xlsx|xls|jpeg|jpg|png|pdf|txt|csv|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
}).single("file");

// Helper Functions
const chunkExcelData = (data: Array<Array<string | number>>): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";
  let rowCount = 0;

  data.forEach((row) => {
    const rowString = row.join(", ") + "\n";

    if (
      currentChunk.length + rowString.length > MAX_CHUNK_SIZE * 4 ||
      rowCount >= 100
    ) {
      chunks.push(currentChunk);
      currentChunk = "";
      rowCount = 0;
    }

    currentChunk += rowString;
    rowCount++;
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const readExcelFile = (filePath: string): ExcelData => {
  const workbook = xlsx.readFile(filePath);
  const allChunks: string[] = [];
  let overallSummary = "";

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<Array<string | number>>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    overallSummary += `Sheet: ${sheetName}\n`;
    if (data[0] && Array.isArray(data[0])) {
      overallSummary += `Headers: ${data[0].join(", ")}\n`;
    }
    overallSummary += `Total Rows: ${data.length - 1}\n\n`;

    const sheetChunks = chunkExcelData(data as Array<Array<string | number>>);
    sheetChunks.forEach((chunk, index) => {
      allChunks.push(`Sheet: ${sheetName} (Part ${index + 1})\n${chunk}`);
    });
  });

  return {
    chunks: allChunks,
    summary: overallSummary,
  };
};

const readWordDocument = async (filePath: string): Promise<string[]> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    const chunks: string[] = [];
    let currentChunk = "";
    let estimatedTokens = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = paragraph.length / 4;

      if (estimatedTokens + paragraphTokens > 2000) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
        estimatedTokens = paragraphTokens;
      } else {
        currentChunk += "\n\n" + paragraph;
        estimatedTokens += paragraphTokens;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  } catch (error) {
    console.error("Error reading Word document:", error);
    throw error;
  }
};

// Main Handler
export const analyzeFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  uploadMiddleware(req, res, async (err: any) => {
    if (err instanceof multer.MulterError || err) {
      res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
      return;
    }

    try {
      const file = req.file;
      const userPrompt = req.body.prompt;

      if (!file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      if (!userPrompt) {
        res.status(400).json({ success: false, message: "No prompt provided" });
        return;
      }

      // Set streaming headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://founders-portal-test-server-client.onrender.com"
      );

      // Initial message
      res.write(
        `data: ${JSON.stringify({
          content: "Starting file analysis...\n\n",
        })}\n\n`
      );

      const fileExtension = path.extname(file.originalname).toLowerCase();
      let fileContent: string = "";

      // Read file content based on type
      if ([".xlsx", ".xls"].includes(fileExtension)) {
        const { summary } = readExcelFile(file.path);
        fileContent = summary;
      } else if ([".doc", ".docx"].includes(fileExtension)) {
        const chunks = await readWordDocument(file.path);
        fileContent = chunks.join("\n\n");
      } else {
        fileContent = fs.readFileSync(file.path, "utf8");
      }

      // Split content into manageable chunks
      const chunks = chunkContent(fileContent);
      const totalChunks = chunks.length;

      // Initial analysis of the first chunk with the user's prompt
      const initialPrompt = `Analyzing the file with your prompt: "${userPrompt}"\n\nAnalyzing part 1 of ${totalChunks}...`;
      res.write(
        `data: ${JSON.stringify({ content: initialPrompt + "\n\n" })}\n\n`
      );

      let previousSummary = "";

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const isFirstChunk = i === 0;
        const isLastChunk = i === chunks.length - 1;

        const systemPrompt = `You are analyzing part ${
          i + 1
        } of ${totalChunks} of a ${fileExtension} file.
            ${
              previousSummary
                ? "Previous analysis summary: " + previousSummary
                : ""
            }
            ${
              isFirstChunk
                ? "Focus on initial analysis and the user's prompt."
                : "Continue the analysis, building on previous parts."
            }
            ${
              isLastChunk
                ? "Provide a final summary and conclusion."
                : "Provide key points from this section."
            }`;

        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `File content:\n${chunks[i]}\n\nUser's request: ${userPrompt}`,
            },
          ],
          stream: true,
          max_tokens: 1500, // Reduced token limit for safety
          temperature: 0.7,
        });

        let chunkResponse = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            chunkResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }

        // Store a brief summary of this chunk's analysis for context in next chunk
        previousSummary = chunkResponse.slice(-500); // Keep last 500 characters as context

        if (!isLastChunk) {
          res.write(
            `data: ${JSON.stringify({
              content: "\n\n---\nContinuing analysis...\n\n",
            })}\n\n`
          );
        }
      }

      // Clean up
      fs.unlinkSync(file.path);
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Analysis error:", error);
      res.write(
        `data: ${JSON.stringify({
          error: "Analysis error",
          details: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      res.end();
      next(error);
    }
  });
};
