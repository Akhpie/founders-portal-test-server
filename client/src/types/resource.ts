export interface ResourceItem {
  _id?: string;
  name: string;
  downloads: number;
  rating: number;
  fileType: string;
  preview: boolean;
  fileUrl?: string;
}

export interface ResourceCategory {
  _id?: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  items: ResourceItem[];
}
