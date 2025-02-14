import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Mock API calls
const mockValidateToken = async (token: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return token === localStorage.getItem("token");
};

const mockRefreshToken = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    access_token: "new_mock_token",
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  accessToken: localStorage.getItem("token"),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ accessToken: token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ isAuthenticated: false });
        return;
      }

      const isValid = await mockValidateToken(token);
      if (isValid) {
        set({ isAuthenticated: true });
      } else {
        // Token is invalid, try to refresh
        const { access_token } = await mockRefreshToken();
        set({ isAuthenticated: true, accessToken: access_token });
        localStorage.setItem("token", access_token);
      }
    } catch (error) {
      console.error(error);
      set({ isAuthenticated: false });
      localStorage.removeItem("token");
    } finally {
      set({ isLoading: false });
    }
  },
}));
