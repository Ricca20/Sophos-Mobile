import { api } from "@/services/api";

export type PatientProfile = {
  patientId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  notificationLanguage?: "en" | "ru";
  profileCompleted?: boolean;
};

export const profileService = {
  async getProfile() {
    const { data } = await api.get<PatientProfile>("/profile");
    return data;
  },
};
