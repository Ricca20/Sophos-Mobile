import { api } from "@/services/api";

export type AppointmentSummary = {
  _id: string;
  applicationId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  doctorEmail?: string;
  patientEmail?: string;
  status?: string;
};

export const appointmentService = {
  async list() {
    const { data } = await api.get<{ applications: AppointmentSummary[] }>("/applications");
    return data.applications ?? [];
  },

  async getById(id: string) {
    const { data } = await api.get<AppointmentSummary>(`/applications/${id}`);
    return data;
  },
};
