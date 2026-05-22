import { api } from "@/services/api";

export type NotificationItem = {
  _id: string;
  title?: string;
  message?: string | { en?: string; ru?: string };
  createdAt?: string;
  type?: string;
};

export const notificationService = {
  async listCommon() {
    const { data } = await api.get<{ notifications: NotificationItem[] }>("/notifications/common");
    return data.notifications ?? [];
  },

  async listPersonal(patientId: string) {
    const { data } = await api.get<{ notifications: NotificationItem[] }>("/notifications/personal", {
      params: { patientId },
    });
    return data.notifications ?? [];
  },
};
