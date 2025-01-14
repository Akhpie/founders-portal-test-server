import axios from "axios";
import { IncubatorTypes } from "../types/incubator";

const API_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const IncubatorService = {
  // Public endpoints
  getPublicIncubatorCompanies: async () => {
    const response = await axios.get<ApiResponse<IncubatorTypes[]>>(
      `${API_URL}/api/incubator-companies`
    );
    return response.data;
  },

  getIncubatorCompanyById: async (id: string) => {
    const response = await axios.get<ApiResponse<IncubatorTypes>>(
      `${API_URL}/api/incubator-companies/${id}`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminIncubatorCompanies: async () => {
    const response = await axios.get<ApiResponse<IncubatorTypes[]>>(
      `${API_URL}/api/admin/incubator-companies`
    );
    return response.data;
  },

  createIncubatorCompany: async (company: Omit<IncubatorTypes, "_id">) => {
    const response = await axios.post<ApiResponse<IncubatorTypes>>(
      `${API_URL}/api/admin/incubator-companies`,
      company
    );
    return response.data;
  },

  updateIncubatorCompany: async (
    id: string,
    company: Partial<IncubatorTypes>
  ) => {
    const response = await axios.put<ApiResponse<IncubatorTypes>>(
      `${API_URL}/api/admin/incubator-companies/${id}`,
      company
    );
    return response.data;
  },

  deleteIncubatorCompany: async (id: string) => {
    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/admin/incubator-companies/${id}`
    );
    return response.data;
  },
};

export default IncubatorService;
