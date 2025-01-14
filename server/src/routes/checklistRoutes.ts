// MAIN BACKEND CONNECTED FILE FOR CHECK LIST
import express, { Request, Response, NextFunction } from "express";
import ChecklistItem from "../models/ChecklistItem";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ChecklistTemplateMain from "../models/ChecklistTemplatemain";
import UserProgress from "../models/UserProgress";

const router = express.Router();

// ** Middleware for authentication
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Backend received token:", token);

    if (!token) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const getChecklistHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get all templates
    const templates = await ChecklistTemplateMain.find({});

    // Get user's progress
    const userProgress = await UserProgress.find({
      userId: new mongoose.Types.ObjectId(req.user?.userId),
    });

    // Combine templates with user progress
    const items = templates.map((template) => {
      const progress = userProgress.find(
        (p) => p.templateId.toString() === template._id.toString()
      );

      return {
        _id: template._id,
        text: template.text,
        category: template.category,
        done: progress ? progress.done : false,
      };
    });

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching checklist items",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const toggleChecklistHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const templateId = new mongoose.Types.ObjectId(req.params.itemId);

    // Find or create user progress
    let progress = await UserProgress.findOne({ userId, templateId });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        templateId,
        done: true, // Since we're toggling from non-existent (false) to true
      });
    } else {
      progress.done = !progress.done;
      await progress.save();
    }

    // Get the template data
    const template = await ChecklistTemplateMain.findById(templateId);

    res.status(200).json({
      success: true,
      data: {
        _id: template?._id,
        text: template?.text,
        category: template?.category,
        done: progress.done,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling checklist item",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const initializeChecklistHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const templates = await ChecklistTemplateMain.find({});

    // Create progress entries for all templates
    const progressEntries = templates.map((template) => ({
      userId,
      templateId: template._id,
      done: false,
    }));

    await UserProgress.insertMany(progressEntries);

    // Return the combined data
    const items = templates.map((template) => ({
      _id: template._id,
      text: template.text,
      category: template.category,
      done: false,
    }));

    res.status(201).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error initializing checklist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getChecklistItems = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  return await ChecklistItem.find({
    userId: new mongoose.Types.ObjectId(userId),
  });
};

const getAdminChecklistHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const templates = await ChecklistTemplateMain.find({});
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching checklist templates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const addAdminChecklistItemHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, category } = req.body;
    const newTemplate = await ChecklistTemplateMain.create({ text, category });
    res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding checklist template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const editAdminChecklistItemHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, category } = req.body;

    if (!text || !category) {
      res.status(400).json({
        success: false,
        message: "Text and category are required",
      });
      return;
    }

    // Update the template
    const template = await ChecklistTemplateMain.findByIdAndUpdate(
      req.params.itemId,
      { text, category },
      { new: true }
    );

    if (!template) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: template._id,
        text: template.text,
        category: template.category,
      },
    });
  } catch (error) {
    console.error("Error updating checklist template:", error);
    res.status(500).json({
      success: false,
      message: "Error updating checklist template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deleteAdminChecklistItemHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // First, delete the template
    const template = await ChecklistTemplateMain.findByIdAndDelete(
      req.params.itemId
    );

    if (!template) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    // Remove all associated user progress for this template
    await UserProgress.deleteMany({ templateId: req.params.itemId });

    res.status(200).json({
      success: true,
      data: {
        _id: template._id,
        text: template.text,
        category: template.category,
      },
    });
  } catch (error) {
    console.error("Error deleting checklist template:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting checklist template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Admin routes (no auth)
router.get("/admin/checklist", getAdminChecklistHandler);
router.post("/admin/checklist", addAdminChecklistItemHandler);
router.put("/admin/checklist/:itemId", editAdminChecklistItemHandler);
router.delete("/admin/checklist/:itemId", deleteAdminChecklistItemHandler);

// Define routes
router.get("/getcheck", authMiddleware, getChecklistHandler);
router.patch("/checklist/:itemId", authMiddleware, toggleChecklistHandler);
router.post(
  "/checklist/initialize",
  authMiddleware,
  initializeChecklistHandler
);

export default router;
