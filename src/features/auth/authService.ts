import { api } from "@/services/api";
import type { AuthResponse } from "@/types/auth";

export const authService = {
  async signIn(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/signin", {
      email,
      password,
    });

    return data;
  },

  async signUp(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/signup", {
      email,
      password,
    });

    return data;
  },

  async signOut() {
    await api.post("/auth/logout");
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });

    return data;
  },
};
