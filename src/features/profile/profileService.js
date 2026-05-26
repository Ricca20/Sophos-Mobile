import { Platform } from "react-native";
import { api } from "@/services/api";

export const profileService = {
  async getProfile() {
    const { data } = await api.get("/profile");
    return data;
  },
  async updateProfile(payload) {
    const { data } = await api.put("/profile", payload);
    return data;
  },
  async uploadProfilePicture(uri, patientId) {
    const formData = new FormData();
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1] || "profile.jpg";
    const fileType = fileName.split(".").pop();

    formData.append("profilePicture", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      name: fileName,
      type: `image/${fileType === "png" ? "png" : "jpeg"}`,
    });
    formData.append("patientId", patientId);

    const { data } = await api.post("/profile/upload-profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
