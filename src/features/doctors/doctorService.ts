import { api } from "@/services/api";

export type DoctorSummary = {
  _id: string;
  firstName?: { en?: string; ru?: string };
  lastName?: { en?: string; ru?: string };
  fullName?: { en?: string; ru?: string };
  specialtyIds?: Array<{ _id: string; name?: { en?: string; ru?: string } }>;
  profileFileId?: string;
  imagePublicUrl?: string | null;
};

export const doctorService = {
  async list() {
    const { data } = await api.get<{ doctors: DoctorSummary[] }>("/doctors");
    return data.doctors;
  },

  async getById(id: string) {
    const { data } = await api.get<DoctorSummary>(`/doctors/${id}`);
    return data;
  },
};
