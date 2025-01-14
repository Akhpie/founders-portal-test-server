import axios from "axios";
import { AngelTypes } from "../types/angels";

const API_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const IncubatorService = {
  // Public endpoints
  getPublicAngelInvestors: async () => {
    const response = await axios.get<ApiResponse<AngelTypes[]>>(
      `${API_URL}/api/angel-investors`
    );
    return response.data;
  },

  getAngelInvestorsById: async (id: string) => {
    const response = await axios.get<ApiResponse<AngelTypes>>(
      `${API_URL}/api/angel-investors/${id}`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminAngelInvestors: async () => {
    const response = await axios.get<ApiResponse<AngelTypes[]>>(
      `${API_URL}/api/admin/angel-investors`
    );
    return response.data;
  },

  createAngelInvestors: async (company: Omit<AngelTypes, "_id">) => {
    const response = await axios.post<ApiResponse<AngelTypes>>(
      `${API_URL}/api/admin/angel-investors`,
      company
    );
    return response.data;
  },

  updateAngelInvestors: async (id: string, company: Partial<AngelTypes>) => {
    const response = await axios.put<ApiResponse<AngelTypes>>(
      `${API_URL}/api/admin/angel-investors/${id}`,
      company
    );
    return response.data;
  },

  deleteAngelInvestors: async (id: string) => {
    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/admin/angel-investors/${id}`
    );
    return response.data;
  },
};

export default IncubatorService;
