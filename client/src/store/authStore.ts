import { create } from "zustand";
import axios from "axios";
import { message } from "antd";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  setAuthenticated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  logout: (logoutFromAll?: boolean) => Promise<void>;
  initAuthListener: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  setAuthenticated: (value) => {
    set({ isAuthenticated: value });
    if (!value) {
      localStorage.removeItem("token");
    }
  },
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  },
  logout: async (logoutFromAll = false) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        // Make the logout API call with the all parameter if needed
        await axios.post(
          `http://localhost:5000/api/logout${logoutFromAll ? "?all=true" : ""}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (logoutFromAll) {
          message.success("Logged out from all devices successfully");
        } else {
          message.success("Logged out successfully");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Error during logout. Please try again.");
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem("token");
      localStorage.setItem("logout", Date.now().toString());
      set({ isAuthenticated: false, token: null });
    }
  },
  initAuthListener: () => {
    window.addEventListener("storage", (event) => {
      if (event.key === "token" && !event.newValue) {
        set({ isAuthenticated: false, token: null });
      }
      if (event.key === "logout") {
        set({ isAuthenticated: false, token: null });
      }
    });
  },
}));
