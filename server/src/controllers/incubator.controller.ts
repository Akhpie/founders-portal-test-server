import { Request, Response } from "express";
import IncubatorCompany from "../models/IncubatorCompany";

const getPublicIncubatorCompaniesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const incubatorCompanies = await IncubatorCompany.find({ isActive: true })
      .select(
        "companyLogo companyName companyLocation companyType institute sector focusIndustries funds socialLinks pointOfContact about IncubatorTypes preferredStartupStage yearOfEstablishment"
      )
      .sort({ companyName: 1 });

    res.status(200).json({
      success: true,
      data: incubatorCompanies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seed companies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAdminIncubatorCompaniesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const incubatorCompanies = await IncubatorCompany.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: incubatorCompanies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Incubators",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getIncubatorCompanyByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await IncubatorCompany.findById(req.params.id);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Incubator company not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seed company",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createIncubatorCompanyHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Incoming data:", req.body);
    const newCompany = new IncubatorCompany(req.body);
    await newCompany.save();

    res.status(201).json({
      success: true,
      message: "Incubator company created successfully",
      data: newCompany,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating seed company",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateIncubatorCompanyHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await IncubatorCompany.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Incubator not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Incubator updated successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Incubator",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deleteIncubatorCompanyHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await IncubatorCompany.findByIdAndDelete(req.params.id);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Seed company not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Seed company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting seed company",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Additional handler for search functionality
const searchIncubatorCompaniesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    const companies = await IncubatorCompany.find({
      isActive: true,
      $or: [
        { companyName: { $regex: query, $options: "i" } },
        { sector: { $regex: query, $options: "i" } },
        { focusIndustries: { $regex: query, $options: "i" } },
      ],
    }).select("companyLogo companyName institute sector focusIndustries funds");

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching Incubator companies",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getPublicIncubatorCompaniesHandler,
  getAdminIncubatorCompaniesHandler,
  getIncubatorCompanyByIdHandler,
  createIncubatorCompanyHandler,
  updateIncubatorCompanyHandler,
  deleteIncubatorCompanyHandler,
  searchIncubatorCompaniesHandler,
};
