import { api } from "@/services/api";

export const authService = {
  async signIn(email, password, deviceInfo, language = "en") {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      deviceInfo,
      language,
    });
    return data;
  },

  async signUp(email, password, language = "en") {
    const { data } = await api.post("/auth/signup", {
      email,
      password,
      language,
    });
    return data;
  },

  async sendOtp(phoneNumber) {
    const { data } = await api.post("/auth/send-otp", {
      phoneNumber,
    });
    return data;
  },

  async verifyOtp(phoneNumber, otp, deviceInfo, language = "en") {
    const { data } = await api.post("/auth/verify-otp", {
      phoneNumber,
      otp,
      deviceInfo,
      language,
    });
    return data;
  },

  async signupOtp(phoneNumber, otp, deviceInfo, language = "en") {
    const { data } = await api.post("/auth/signup-otp", {
      phoneNumber,
      otp,
      deviceInfo,
      language,
    });
    return data;
  },

  async signOut(refreshToken) {
    await api.post(
      "/auth/logout",
      { refreshToken },
      {
        headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
      }
    );
  },

  async refresh(refreshToken) {
    const { data } = await api.post("/auth/refresh", {
      refreshToken,
    });
    return data;
  },

  async forgotPassword(email, language = "en") {
    const { data } = await api.post("/auth/forgot-password", {
      email,
      language,
    });
    return data;
  },
};
