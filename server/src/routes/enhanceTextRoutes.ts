import express from "express";
import { enhanceTextHandler } from "../controllers/enhanceTextController";

const router = express.Router();

router.post("/enhance-text", enhanceTextHandler);

export default router;
