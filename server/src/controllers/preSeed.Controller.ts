import { Request, Response } from "express";
import preSeedCompany from "../models/preSeedCompany";

const getPublicPreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const PreSeedInvestors = await preSeedCompany
      .find({ isActive: true })
      .select(
        "preseedLogo preseedName preseedLocation preseedType sector focusIndustries socialLinks about preseedTypes preferredStartupStage investedCompanies noOfInvestedCompanies"
      )
      .sort({ preseedName: 1 });

    res.status(200).json({
      success: true,
      data: PreSeedInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching preseed Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAdminPreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const PreSeedInvestors = await preSeedCompany.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: PreSeedInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching PreSeedInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getPreSeedInvestorsByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await preSeedCompany.findById(req.params.id);

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "PreSeedInvestors not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: preseed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching PreSeedInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createPreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Incoming data:", req.body);
    const newPreSeedInvestor = new preSeedCompany(req.body);
    await newPreSeedInvestor.save();

    res.status(201).json({
      success: true,
      message: "preseed Investor created successfully",
      data: newPreSeedInvestor,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating preseed Investor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updatePreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await preSeedCompany.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "preseed Investor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "preseed Investor updated successfully",
      data: preseed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating preseed Investor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deletePreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await preSeedCompany.findByIdAndDelete(req.params.id);

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "preseed not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "preseed deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting preseed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Additional handler for search functionality
const searchPreSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    const preseeds = await preSeedCompany
      .find({
        isActive: true,
        $or: [
          { preseedName: { $regex: query, $options: "i" } },
          { sector: { $regex: query, $options: "i" } },
          { focusIndustries: { $regex: query, $options: "i" } },
        ],
      })
      .select("preseedLogo preseedName sector focusIndustries");

    res.status(200).json({
      success: true,
      data: preseeds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching preseed Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getPublicPreSeedInvestorsHandler,
  getAdminPreSeedInvestorsHandler,
  getPreSeedInvestorsByIdHandler,
  createPreSeedInvestorsHandler,
  updatePreSeedInvestorsHandler,
  deletePreSeedInvestorsHandler,
  searchPreSeedInvestorsHandler,
};
