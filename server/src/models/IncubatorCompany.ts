import mongoose, { Document, Schema } from "mongoose";

export interface IincubatorCompany extends Document {
  companyLogo: string;
  companyName: string;
  companyType: string;
  institute: string;
  focusIndustries: string[];
  about: string;
  preferredStartupStage: string[];
  yearOfEstablishment: number;
  sector: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  pointOfContact: {
    name: string;
    email: string;
    position: string;
  };
  funds: {
    minInvestment: number;
    maxInvestment: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IncubatorCompanySchema = new Schema(
  {
    companyLogo: {
      type: String,
      required: [true, "Company logo is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyLocation: {
      type: String,
      required: [true, "Company location is required"],
    },
    companyType: {
      type: String,
      required: [true, "Company type is required"],
      enum: ["VC", "Angel", "Accelerator", "Incubator"],
    },
    institute: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
    },
    focusIndustries: [
      {
        type: String,
        required: [true, "At least one focus industry is required"],
      },
    ],
    about: {
      type: String,
      required: [true, "Company description is required"],
      trim: true,
    },
    preferredStartupStage: {
      type: [String],
      required: [true, "Preferred startup stage is required"],
      enum: ["Idea", "MVP", "Early Stage", "Growth", "Scale"],
    },
    yearOfEstablishment: {
      type: Number,
      required: [true, "Year of establishment is required"],
      min: 1900,
      max: new Date().getFullYear(),
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
    pointOfContact: {
      name: {
        type: String,
        required: [true, "Contact name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Contact email is required"],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
      position: {
        type: String,
        required: [true, "Contact position is required"],
        trim: true,
      },
    },
    funds: {
      minInvestment: {
        type: Number,
        required: [true, "Minimum investment amount is required"],
        min: 0,
      },
      maxInvestment: {
        type: Number,
        required: [true, "Maximum investment amount is required"],
        min: 0,
      },
      currency: {
        type: String,
        required: [true, "Currency is required"],
        default: "USD",
        enum: ["USD", "EUR", "GBP", "INR"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better search performance
IncubatorCompanySchema.index({
  companyName: "text",
  sector: "text",
  focusIndustries: "text",
});

// Fixed pre-save middleware with proper typing and null checks
IncubatorCompanySchema.pre<IincubatorCompany>("save", function (next) {
  if (
    this.funds &&
    typeof this.funds.maxInvestment === "number" &&
    typeof this.funds.minInvestment === "number" &&
    this.funds.maxInvestment < this.funds.minInvestment
  ) {
    return next(
      new Error("Maximum investment must be greater than minimum investment")
    );
  }
  next();
});

export default mongoose.model<IincubatorCompany>(
  "IncubatorCompany",
  IncubatorCompanySchema
);
