export interface SeedTypes {
  _id: string;
  seedLogo: string;
  seedName: string;
  seedType: string;
  seedLocation: string;
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
