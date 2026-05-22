import { api } from "@/services/api";

export type MeetingJoinResponse = {
  status: boolean;
  roomId: string;
  token?: string;
  joinUrl?: string;
  isAdmin?: boolean;
  role?: string;
  name?: string;
};

export const meetingService = {
  async joinByUser(payload: {
    roomId?: string;
    applicationId?: string;
    userEmail?: string;
    role?: string;
    name?: string;
    profilePic?: string;
  }) {
    const { data } = await api.post<MeetingJoinResponse>("/meetings/join-by-user", payload);
    return data;
  },

  async joinDoctorRoom(doctorId: string, payload: { role?: string; profilePic?: string; name?: string }) {
    const { data } = await api.post<MeetingJoinResponse>(`/meetings/doctor/${doctorId}/join`, payload);
    return data;
  },
};
