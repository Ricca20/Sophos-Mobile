import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sessionStorage } from "@/utils/storage";
import { authService } from "@/features/auth/authService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const hydrateSession = async () => {
    const storedUser = await sessionStorage.getUser();
    const storedToken = await sessionStorage.getAccessToken();

    setUser(storedUser);
    setAccessToken(storedToken);
    setIsBootstrapping(false);
  };

  useEffect(() => {
    void hydrateSession();
  }, []);

  const applyAuthResponse = async (response) => {
    setUser(response.user);
    setAccessToken(response.accessToken);

    await sessionStorage.saveUser(response.user);
    await sessionStorage.saveAccessToken(response.accessToken);
    await sessionStorage.saveRefreshToken(response.refreshToken ?? null);
  };

  const signIn = async (email, password) => {
    const response = await authService.signIn(email, password);
    await applyAuthResponse(response);
  };

  const signUp = async (email, password) => {
    const response = await authService.signUp(email, password);
    await applyAuthResponse(response);
  };

  const signOut = async () => {
    await authService.signOut();
    await sessionStorage.clear();
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isBootstrapping,
      isAuthenticated: Boolean(user && accessToken),
      signIn,
      signUp,
      signOut,
      hydrateSession,
    }),
    [accessToken, hydrateSession, isBootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};
