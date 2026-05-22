import { api } from "@/services/api";

export const profileService = {
  async getProfile() {
    const { data } = await api.get("/profile");
    return data;
  },
};
