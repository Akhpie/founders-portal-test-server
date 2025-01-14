import { Request, Response } from "express";
import seedCompany from "../models/seedCompany";

const getPublicSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const SeedInvestors = await seedCompany
      .find({ isActive: true })
      .select(
        "seedLogo seedName seedLocation seedType sector focusIndustries socialLinks about preseedTypes preferredStartupStage investedCompanies noOfInvestedCompanies"
      )
      .sort({ seedName: 1 });

    res.status(200).json({
      success: true,
      data: SeedInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seed Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAdminSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const SeedInvestors = await seedCompany.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: SeedInvestors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SeedInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getSeedInvestorsByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await seedCompany.findById(req.params.id);

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "SeedInvestors not found",
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
      message: "Error fetching SeedInvestors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Incoming data:", req.body);
    const newSeedInvestor = new seedCompany(req.body);
    await newSeedInvestor.save();

    res.status(201).json({
      success: true,
      message: "seed Investor created successfully",
      data: newSeedInvestor,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating seed Investor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await seedCompany.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "seed Investor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "seed Investor updated successfully",
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

const deleteSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const preseed = await seedCompany.findByIdAndDelete(req.params.id);

    if (!preseed) {
      res.status(404).json({
        success: false,
        message: "seed not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "seed deleted successfully",
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
const searchSeedInvestorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    const seeds = await seedCompany
      .find({
        isActive: true,
        $or: [
          { seedName: { $regex: query, $options: "i" } },
          { sector: { $regex: query, $options: "i" } },
          { focusIndustries: { $regex: query, $options: "i" } },
        ],
      })
      .select("seedLogo seedName sector focusIndustries");

    res.status(200).json({
      success: true,
      data: seeds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching seed Investors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getPublicSeedInvestorsHandler,
  getAdminSeedInvestorsHandler,
  getSeedInvestorsByIdHandler,
  createSeedInvestorsHandler,
  updateSeedInvestorsHandler,
  deleteSeedInvestorsHandler,
  searchSeedInvestorsHandler,
};
