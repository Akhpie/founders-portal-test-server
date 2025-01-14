// utils/docExport.ts
import { Document, Packer, Paragraph, TextRun } from "docx";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ChatMessage } from "./types";

export const exportChatToDoc = async (
  messages: ChatMessage[]
): Promise<void> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Chat Conversation Export",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on: ${new Date().toLocaleString()}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun("")],
          }),
          ...messages.flatMap((message: ChatMessage) => {
            // Convert markdown to plain text and sanitize
            const htmlContent = marked.parse(message.content || "");
            const sanitizedContent =
              typeof htmlContent === "string"
                ? DOMPurify.sanitize(htmlContent, { ALLOWED_TAGS: [] })
                : "";

            const sender =
              message.type === "assistant" ? "AI Assistant" : "You";
            const time =
              message.timestamp instanceof Date
                ? message.timestamp.toLocaleTimeString()
                : new Date(message.timestamp).toLocaleTimeString();

            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${sender} - ${time}`,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizedContent,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("")],
              }),
            ];
          }),
        ],
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chat-export.docx";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
