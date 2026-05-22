import { api } from "@/services/api";

export const appointmentService = {
  async list() {
    const { data } = await api.get("/applications");
    return data.applications ?? [];
  },

  async getById(id) {
    const { data } = await api.get(`/applications/${id}`);
    return data;
  },
};
