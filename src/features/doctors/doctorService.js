import { api } from "@/services/api";

export const doctorService = {
  async list() {
    const { data } = await api.get("/doctors");
    return data.doctors;
  },

  async getById(id) {
    const { data } = await api.get(`/doctors/${id}`);
    return data;
  },
};
