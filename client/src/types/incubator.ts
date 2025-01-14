export interface IncubatorTypes {
  _id: string;
  companyLogo: string;
  companyName: string;
  companyType: string;
  companyLocation: string;
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
}
