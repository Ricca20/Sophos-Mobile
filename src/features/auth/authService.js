import { api } from "@/services/api";

export const authService = {
  async signIn(email, password) {
    const { data } = await api.post("/auth/signin", {
      email,
      password,
    });

    return data;
  },

  async signUp(email, password) {
    const { data } = await api.post("/auth/signup", {
      email,
      password,
    });

    return data;
  },

  async signOut() {
    await api.post("/auth/logout");
  },

  async refresh(refreshToken) {
    const { data } = await api.post("/auth/refresh", {
      refreshToken,
    });

    return data;
  },
};
