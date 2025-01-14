export interface PreSeedTypes {
  _id: string;
  preseedLogo: string;
  preseedName: string;
  preseedType: string;
  preseedLocation: string;
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
  investedCompanies?: Array<{
    companyName: string;
    companyLogo: string;
    investmentYear: number;
    companyWebsite?: string;
  }>;
}
