import axios from "axios";
import { PreSeedTypes } from "../types/preseed";

const API_URL = "https://founders-portal-test-server-apii.onrender.com";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const PreSeedService = {
  // Public endpoints
  getPublicPreSeedInvestors: async () => {
    const response = await axios.get<ApiResponse<PreSeedTypes[]>>(
      `${API_URL}/api/preseed-investors`
    );
    return response.data;
  },

  getPreSeedInvestorsById: async (id: string) => {
    const response = await axios.get<ApiResponse<PreSeedTypes>>(
      `${API_URL}/api/preseed-investors/${id}`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminPreSeedInvestors: async () => {
    const response = await axios.get<ApiResponse<PreSeedTypes[]>>(
      `${API_URL}/api/admin/preseed-investors`
    );
    return response.data;
  },

  createPreSeedInvestors: async (company: Omit<PreSeedTypes, "_id">) => {
    const response = await axios.post<ApiResponse<PreSeedTypes>>(
      `${API_URL}/api/admin/preseed-investors`,
      company
    );
    return response.data;
  },

  updatePreSeedInvestors: async (
    id: string,
    company: Partial<PreSeedTypes>
  ) => {
    const response = await axios.put<ApiResponse<PreSeedTypes>>(
      `${API_URL}/api/admin/preseed-investors/${id}`,
      company
    );
    return response.data;
  },

  deletePreSeedInvestors: async (id: string) => {
    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/admin/preseed-investors/${id}`
    );
    return response.data;
  },
};

export default PreSeedService;
