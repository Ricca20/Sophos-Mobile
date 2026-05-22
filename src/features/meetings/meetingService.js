import { api } from "@/services/api";

export const meetingService = {
  async joinByUser(payload) {
    const { data } = await api.post("/meetings/join-by-user", payload);
    return data;
  },

  async joinDoctorRoom(doctorId, payload) {
    const { data } = await api.post(`/meetings/doctor/${doctorId}/join`, payload);
    return data;
  },
};
