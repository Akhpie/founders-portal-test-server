import axios from "axios";
import { SeedTypes } from "../types/seed";

const API_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const SeedService = {
  // Public endpoints
  getPublicSeedInvestors: async () => {
    const response = await axios.get<ApiResponse<SeedTypes[]>>(
      `${API_URL}/api/seed-investors`
    );
    return response.data;
  },

  getSeedInvestorsById: async (id: string) => {
    const response = await axios.get<ApiResponse<SeedTypes>>(
      `${API_URL}/api/seed-investors/${id}`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminSeedInvestors: async () => {
    const response = await axios.get<ApiResponse<SeedTypes[]>>(
      `${API_URL}/api/admin/seed-investors`
    );
    return response.data;
  },

  createSeedInvestors: async (company: Omit<SeedTypes, "_id">) => {
    const response = await axios.post<ApiResponse<SeedTypes>>(
      `${API_URL}/api/admin/seed-investors`,
      company
    );
    return response.data;
  },

  updateSeedInvestors: async (id: string, company: Partial<SeedTypes>) => {
    const response = await axios.put<ApiResponse<SeedTypes>>(
      `${API_URL}/api/admin/seed-investors/${id}`,
      company
    );
    return response.data;
  },

  deleteSeedInvestors: async (id: string) => {
    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/admin/seed-investors/${id}`
    );
    return response.data;
  },
};

export default SeedService;
