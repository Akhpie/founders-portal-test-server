import express from "express";
import { chatHandler } from "../../controllers/chatController";
import { analyzeFileHandler } from "../../../handlers/fileAnalysisHandler";
import {
  googleAuthHandler,
  googleCallbackHandler,
  scheduleMeetingHandler,
} from "../../../handlers/meetingHandler";

const router = express.Router();

router.post("/chat", chatHandler);
router.post("/analyze-file", analyzeFileHandler);

// Meeting scheduler routes
router.post("/schedule-meeting", scheduleMeetingHandler);
router.get("/auth/google", googleAuthHandler);
router.get("/auth/callback", googleCallbackHandler);

export default router;
