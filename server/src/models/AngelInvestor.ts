import mongoose, { Document, Schema } from "mongoose";

export interface IangelInvestor extends Document {
  angelLogo: string;
  angelName: string;
  angelType: string;
  focusIndustries: string[];
  about: string;
  preferredStartupStage: string[];
  sector: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  investedCompanies: Array<{
    companyName: string;
    companyLogo: string;
    investmentYear: number;
    companyWebsite?: string;
  }>;
}

const AngelInvestorSchema = new Schema(
  {
    angelLogo: {
      type: String,
      required: [true, "angel logo is required"],
    },
    angelName: {
      type: String,
      required: [true, "angel name is required"],
      trim: true,
    },
    angelLocation: {
      type: String,
      required: [true, "angel location is required"],
    },
    angelType: {
      type: String,
      required: [true, "angel type is required"],
      enum: ["Angel"],
    },
    focusIndustries: [
      {
        type: String,
        required: [true, "At least one focus industry is required"],
      },
    ],
    about: {
      type: String,
      required: [true, "angel investor description is required"],
      trim: true,
    },
    preferredStartupStage: {
      type: [String],
      required: [true, "Preferred startup stage is required"],
      enum: ["Idea", "MVP", "Early Stage", "Growth", "Scale"],
    },
    sector: [
      {
        type: String,
        required: [true, "At least one Sector is required"],
      },
    ],
    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        required: [true, "Website URL is required"],
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    investedCompanies: [
      {
        companyName: {
          type: String,
          required: true,
        },
        companyLogo: {
          type: String,
          required: true,
        },
        investmentYear: {
          type: Number,
          required: true,
        },
        companyWebsite: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for better search performance
AngelInvestorSchema.index({
  angelName: "text",
  sector: "text",
  focusIndustries: "text",
});

// Fixed pre-save middleware with proper typing and null checks

export default mongoose.model<IangelInvestor>(
  "AngelInvestor",
  AngelInvestorSchema
);
