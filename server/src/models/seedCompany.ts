import mongoose, { Document, Schema } from "mongoose";

export interface IseedInvestor extends Document {
  seedLogo: string;
  seedName: string;
  seedType: string;
  focusIndustries: string[];
  about: string;
  noOfInvestedCompanies: number;
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

const SeedSchema = new Schema(
  {
    seedLogo: {
      type: String,
      required: [true, "seed logo is required"],
    },
    seedName: {
      type: String,
      required: [true, "seed name is required"],
      trim: true,
    },
    seedLocation: {
      type: String,
      required: [true, "seed location is required"],
    },
    seedType: {
      type: String,
      required: [true, "seed type is required"],
      enum: ["Seed"],
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
    noOfInvestedCompanies: {
      type: Number,
      required: [true, "Number of invested companies is required"],
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
SeedSchema.index({
  seedName: "text",
  sector: "text",
  focusIndustries: "text",
});

// Fixed pre-save middleware with proper typing and null checks

export default mongoose.model<IseedInvestor>("SeedInvestor", SeedSchema);
