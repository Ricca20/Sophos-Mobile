import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { sessionStorage } from "@/utils/storage";
import { authService } from "@/features/auth/authService";
import { buildDeviceInfo } from "@/utils/deviceInfo";
import { setAuthContext } from "@/services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [language, setLanguage] = useState("en");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const hydrateSession = useCallback(async () => {
    const storedUser = await sessionStorage.getUser();
    const storedToken = await sessionStorage.getAccessToken();
    const storedLang = await sessionStorage.getLanguage();

    setUser(storedUser);
    setAccessToken(storedToken);
    setLanguage(storedLang);
    setIsBootstrapping(false);
  }, []);

  const changeLanguage = useCallback(async (newLang) => {
    setLanguage(newLang);
    await sessionStorage.saveLanguage(newLang);
  }, []);

  const updateToken = useCallback(async (newAccess, newRefresh) => {
    setAccessToken(newAccess);
    await sessionStorage.saveAccessToken(newAccess);
    if (newRefresh) {
      await sessionStorage.saveRefreshToken(newRefresh);
    }
  }, []);

  const applyAuthResponse = async (response) => {
    if (response?.accessToken && response?.user) {
      setUser(response.user);
      setAccessToken(response.accessToken);

      await sessionStorage.saveUser(response.user);
      await sessionStorage.saveAccessToken(response.accessToken);
      await sessionStorage.saveRefreshToken(response.refreshToken ?? null);
    }
  };

  const signIn = async (email, password, language = "en") => {
    const devInfo = await buildDeviceInfo();
    const response = await authService.signIn(email, password, devInfo, language);
    await applyAuthResponse(response);
    return response;
  };

  const signUp = async (email, password, language = "en") => {
    const response = await authService.signUp(email, password, language);
    return response;
  };

  const sendOtp = async (phoneNumber) => {
    return await authService.sendOtp(phoneNumber);
  };

  const verifyOtpSignIn = async (phoneNumber, otp, language = "en") => {
    const devInfo = await buildDeviceInfo();
    const response = await authService.verifyOtp(phoneNumber, otp, devInfo, language);
    await applyAuthResponse(response);
    return response;
  };

  const verifyOtpSignUp = async (phoneNumber, otp, language = "en") => {
    const devInfo = await buildDeviceInfo();
    const response = await authService.signupOtp(phoneNumber, otp, devInfo, language);
    await applyAuthResponse(response);
    return response;
  };

  const signOut = useCallback(async () => {
    try {
      const rt = await sessionStorage.getRefreshToken();
      if (rt) {
        await authService.signOut(rt);
      }
    } catch (err) {
      console.warn("Sign out API call error:", err);
    } finally {
      await sessionStorage.clear();
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const sendPasswordResetEmail = async (email, language = "en") => {
    return await authService.forgotPassword(email, language);
  };

  const syncPatientProfile = useCallback(async (profileData) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...profileData };
      void sessionStorage.saveUser(next);
      return next;
    });
  }, []);

  useEffect(() => {
    void hydrateSession();
    setAuthContext({
      updateToken,
      signOut,
    });
    return () => {
      setAuthContext(null);
    };
  }, [hydrateSession, updateToken, signOut]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      language,
      isBootstrapping,
      isAuthenticated: Boolean(user && accessToken),
      signIn,
      signUp,
      signOut,
      sendOtp,
      verifyOtpSignIn,
      verifyOtpSignUp,
      sendPasswordResetEmail,
      syncPatientProfile,
      hydrateSession,
      updateToken,
      changeLanguage,
    }),
    [accessToken, hydrateSession, isBootstrapping, user, signOut, syncPatientProfile, updateToken, language, changeLanguage],
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
