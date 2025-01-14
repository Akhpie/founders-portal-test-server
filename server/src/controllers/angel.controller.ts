import { Request, Response } from "express";
import AngelInvestor from "../models/AngelInvestor";

const getPublicAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const angelInvestors = await AngelInvestor.find({ isActive: true })
      .select(
        "angelLogo angelName angelLocation angelType sector focusIndustries socialLinks about angelTypes preferredStartupStage investedCompanies"
      )
      .sort({ angelName: 1 });

    res.status(200).json({
      success: true,
      data: angelInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching angel Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAdminAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const angelInvestors = await AngelInvestor.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: angelInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching angelInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAngelInvestorsByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const angel = await AngelInvestor.findById(req.params.id);

    if (!angel) {
      res.status(404).json({
        success: false,
        message: "angelInvestors not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: angel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching angelInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Incoming data:", req.body);
    const newAngelInvestor = new AngelInvestor(req.body);
    await newAngelInvestor.save();

    res.status(201).json({
      success: true,
      message: "AngelInvestor created successfully",
      data: newAngelInvestor,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating AngelInvestor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const angel = await AngelInvestor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!angel) {
      res.status(404).json({
        success: false,
        message: "AngelInvestor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "AngelInvestor updated successfully",
      data: angel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating AngelInvestor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deleteAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const angel = await AngelInvestor.findByIdAndDelete(req.params.id);

    if (!angel) {
      res.status(404).json({
        success: false,
        message: "angel not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "angel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting angel",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Additional handler for search functionality
const searchAngelInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    const angels = await AngelInvestor.find({
      isActive: true,
      $or: [
        { angelName: { $regex: query, $options: "i" } },
        { sector: { $regex: query, $options: "i" } },
        { focusIndustries: { $regex: query, $options: "i" } },
      ],
    }).select("angelLogo angelName sector focusIndustries");

    res.status(200).json({
      success: true,
      data: angels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching angel Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getPublicAngelInvestorsHandler,
  getAdminAngelInvestorsHandler,
  getAngelInvestorsByIdHandler,
  createAngelInvestorsHandler,
  updateAngelInvestorsHandler,
  deleteAngelInvestorsHandler,
  searchAngelInvestorsHandler,
};
