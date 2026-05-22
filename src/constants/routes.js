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
    doctor: (id) => `/doctor/${id}`,
    appointment: (id) => `/appointment/${id}`,
    meeting: (roomId) => `/meeting/${roomId}`,
  },
};
