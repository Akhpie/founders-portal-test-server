import express, { Request, Response } from "express";
import Faq from "../models/Faq";

const router = express.Router();

// Handler Functions
const getPublicFaqsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const faqs = await Faq.find({ isActive: true });

    const categorizedFaqs = faqs.reduce((acc: any, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        key: faq._id,
        label: faq.question,
        content: faq.answer,
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: categorizedFaqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAdminFaqsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const faqs = await Faq.find().sort({ category: 1 });
    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createFaqHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.status(201).json({
      success: true,
      data: faq,
      message: "FAQ created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateFaqHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!faq) {
      res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: faq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deleteFaqHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Public routes
router.get("/faqs", getPublicFaqsHandler);

// Admin routes
router.get("/admin/faqs", getAdminFaqsHandler);
router.post("/admin/faqs", createFaqHandler);
router.put("/admin/faqs/:id", updateFaqHandler);
router.delete("/admin/faqs/:id", deleteFaqHandler);

export default router;
