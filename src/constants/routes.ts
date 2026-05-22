export const routes = {
  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    forgotPassword: "/forgot-password",
  },
  tabs: {
    home: "/home",
    doctors: "/doctors",
    appointments: "/appointments",
    notifications: "/notifications",
    profile: "/profile",
  },
  detail: {
    doctor: (id: string) => `/doctor/${id}`,
    appointment: (id: string) => `/appointment/${id}`,
    meeting: (roomId: string) => `/meeting/${roomId}`,
  },
} as const;
