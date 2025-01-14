import axios from "axios";

const API_URL = "http://localhost:5000";

export interface FAQ {
  _id: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const faqService = {
  // Public endpoints
  getPublicFaqs: async () => {
    const response = await axios.get<ApiResponse<any>>(
      `${API_URL}/api/faq/faqs`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminFaqs: async () => {
    const response = await axios.get<ApiResponse<FAQ[]>>(
      `${API_URL}/api/faq/admin/faqs`
    );
    return response.data;
  },

  createFaq: async (faq: Omit<FAQ, "_id" | "createdAt" | "updatedAt">) => {
    const response = await axios.post<ApiResponse<FAQ>>(
      `${API_URL}/api/faq/admin/faqs`,
      faq
    );
    return response.data;
  },

  updateFaq: async (id: string, faq: Partial<FAQ>) => {
    const response = await axios.put<ApiResponse<FAQ>>(
      `${API_URL}/api/faq/admin/faqs/${id}`,
      faq
    );
    return response.data;
  },

  deleteFaq: async (id: string) => {
    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/faq/admin/faqs/${id}`
    );
    return response.data;
  },
};

export default faqService;
