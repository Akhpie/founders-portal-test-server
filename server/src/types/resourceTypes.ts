export interface ResourceItem {
  _id?: string;
  name: string;
  downloads: string;
  rating: number;
  fileType: string;
  preview: boolean;
  fileUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for resource categories
export interface ResourceCategory {
  _id?: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  items: ResourceItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for form data when creating/updating categories
export interface CategoryFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  items?: ResourceItem[];
}

// Response interface for API calls
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface for pagination
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// Interface for filter/search params
export interface ResourceFilters {
  search?: string;
  fileType?: string[];
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
