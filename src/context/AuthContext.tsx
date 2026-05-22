import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthResponse, AuthUser } from "@/types/auth";
import { sessionStorage } from "@/utils/storage";
import { authService } from "@/features/auth/authService";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const hydrateSession = async () => {
    const storedUser = await sessionStorage.getUser<AuthUser>();
    const storedToken = await sessionStorage.getAccessToken();

    setUser(storedUser);
    setAccessToken(storedToken);
    setIsBootstrapping(false);
  };

  useEffect(() => {
    void hydrateSession();
  }, []);

  const applyAuthResponse = async (response: AuthResponse) => {
    setUser(response.user);
    setAccessToken(response.accessToken);

    await sessionStorage.saveUser(response.user);
    await sessionStorage.saveAccessToken(response.accessToken);
    await sessionStorage.saveRefreshToken(response.refreshToken ?? null);
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.signIn(email, password);
    await applyAuthResponse(response);
  };

  const signUp = async (email: string, password: string) => {
    const response = await authService.signUp(email, password);
    await applyAuthResponse(response);
  };

  const signOut = async () => {
    await authService.signOut();
    await sessionStorage.clear();
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo<AuthContextValue>(
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
