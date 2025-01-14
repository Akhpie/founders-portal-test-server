export interface AngelTypes {
  _id: string;
  angelLogo: string;
  angelName: string;
  angelType: string;
  angelLocation: string;
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
  investedCompanies?: Array<{
    companyName: string;
    companyLogo: string;
    investmentYear: number;
    companyWebsite?: string;
  }>;
}
