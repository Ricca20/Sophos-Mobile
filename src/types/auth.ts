export type Role =
  | "patient"
  | "doctor"
  | "manager"
  | "assistant"
  | "head_manager"
  | "head_assistant"
  | "head_doctor"
  | "specialist"
  | "super_admin"
  | "content_manager";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  profileCompleted?: boolean;
  name?: string;
};

export type AuthResponse = {
  success?: boolean;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};
