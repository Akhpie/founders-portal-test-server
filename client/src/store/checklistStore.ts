import { create } from "zustand";
import axios from "axios";

interface ChecklistStore {
  progress: number;
  setProgress: (progress: number) => void;
  fetchProgress: () => Promise<void>;
}

export const useChecklistStore = create<ChecklistStore>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
  fetchProgress: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/check/getcheck",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const items = response.data.data;
      if (items.length > 0) {
        const progress = Math.round(
          (items.filter((item: any) => item.done).length / items.length) * 100
        );
        set({ progress });
      }
    } catch (error) {
      console.error("Error fetching checklist progress:", error);
    }
  },
}));
