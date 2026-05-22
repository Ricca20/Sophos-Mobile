import { api } from "@/services/api";

export const notificationService = {
  async listCommon() {
    const { data } = await api.get("/notifications/common");
    return data.notifications ?? [];
  },

  async listPersonal(patientId) {
    const { data } = await api.get("/notifications/personal", {
      params: { patientId },
    });
    return data.notifications ?? [];
  },
};
