// utils/pdfExport.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ChatMessage } from "./types";

export const exportChatToPDF = (messages: ChatMessage[]): void => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("Chat Conversation Export", 20, 20);
  doc.setFontSize(12);

  // Add timestamp
  const timestamp = new Date().toLocaleString();
  doc.text(`Generated on: ${timestamp}`, 20, 30);

  let yPos = 40;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  messages.forEach((message: ChatMessage, index: number) => {
    // Add spacing between messages
    if (index > 0) yPos += 10;

    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }

    // Add sender info
    doc.setFont("helvetica", "bold"); // Using "helvetica" instead of undefined
    const sender = message.type === "assistant" ? "AI Assistant" : "You";
    const time =
      message.timestamp instanceof Date
        ? message.timestamp.toLocaleTimeString()
        : new Date(message.timestamp).toLocaleTimeString();
    doc.text(`${sender} - ${time}`, margin, yPos);
    yPos += 7;

    // Convert markdown to plain text and sanitize
    const htmlContent = marked.parse(message.content || "");
    if (typeof htmlContent === "string") {
      const sanitizedContent = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [],
      });

      // Split text into lines that fit the page width
      doc.setFont("helvetica", "normal"); // Using "helvetica" instead of undefined
      const textLines = doc.splitTextToSize(sanitizedContent, maxWidth);

      // Add message content
      textLines.forEach((line: string) => {
        // Check if we need a new page for this line
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 7;
      });
    }
  });

  // Save the PDF
  doc.save("chat-export.pdf");
};
