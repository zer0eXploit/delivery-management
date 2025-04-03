import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const validateToken = async (token: string) => {
  const response = await fetch(import.meta.env.VITE_GQL_HOST + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query {
          me {
            id
          }
        }
      `,
    }),
  });

  if (!response.ok) return false;

  const data = await response.json();
  if (data.errors) return false;

  console.log(data);
  return true;
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

      const isValid = await validateToken(token);

      if (isValid) set({ isAuthenticated: true });
      else throw new Error("Invalid token");
    } catch (error) {
      console.error(error);
      set({ isAuthenticated: false });
      localStorage.removeItem("token");
    } finally {
      set({ isLoading: false });
    }
  },
}));
