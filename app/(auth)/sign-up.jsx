import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { spacing } from "@/theme/spacing";
import { t } from "@/utils/i18n";
import { PhoneInput } from "@/components/PhoneInput";
import { AppInput } from "@/components/AppInput";


// Password Checklist Component
const PasswordCriteria = ({ label, met }) => {
  return (
    <View style={styles.criteriaRow}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={met ? "#1E9E6A" : "#94A3B8"}
      />
      <Text style={[styles.criteriaText, met ? styles.criteriaTextMet : styles.criteriaTextUnmet]}>
        {label}
      </Text>
    </View>
  );
};

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, sendOtp, verifyOtpSignUp } = useAuth();
  
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("email"); 
  const [isLoading, setIsLoading] = useState(false);

  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const scrollViewRef = useRef(null);


  // OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState("send"); 
  const [otpError, setOtpError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time strength criteria
  const isLenMet = password.length >= 8;
  const isSymbolMet = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isNumMet = /\d/.test(password);
  const isUpperMet = /[A-Z]/.test(password);
  const isLowerMet = /[a-z]/.test(password);

  const isPasswordStrong = isLenMet && isSymbolMet && isNumMet && isUpperMet && isLowerMet;

  const shouldScroll = password.length > 0 && !isPasswordStrong;

  // Auto-scroll to reveal password requirements & bottom elements when they appear
  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  // Reset states when changing tab
  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
    setConfirmPasswordError("");
    setPhoneNumber("");
    setOtpCode("");
    setOtpStep("send");
    setOtpError("");
  }, [activeTab]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !emailRegex.test(val)) {
      setEmailError(t("signup.emailError", lang));
    } else {
      setEmailError("");
    }
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (val && val !== password) {
      setConfirmPasswordError(t("signup.passwordMismatchError", lang));
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async () => {
    if (!emailRegex.test(email) || !isPasswordStrong || password !== confirmPassword) {
      Alert.alert(t("signup.signupError", lang), t("signup.formError", lang));
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, lang);
      Alert.alert(
        "Account Created",
        t("signup.signupSuccess", lang),
        [{ text: "OK", onPress: () => router.replace("/sign-in") }]
      );
    } catch (error) {
      Alert.alert(t("signup.signupError", lang), error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setOtpError(t("signup.otp.phoneRequired", lang));
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setOtpError(t("signup.otp.invalidPhone", lang));
      return;
    }
    
    setIsLoading(true);
    setOtpError("");
    try {
      await sendOtp(phoneNumber);
      Alert.alert("OTP Sent", t("signup.otp.otpSent", lang));
      setOtpStep("verify");
      setOtpCode("");
    } catch (error) {
      const errMsg = error?.response?.data?.message || t("signup.otp.sendFailed", lang);
      setOtpError(errMsg);
      Alert.alert("Failed", errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpError(t("signup.otp.otpRequired", lang));
      return;
    }
    if (!/^\d{4,6}$/.test(otpCode)) {
      setOtpError(t("signup.otp.invalidOtp", lang));
      return;
    }

    setIsLoading(true);
    setOtpError("");
    try {
      await verifyOtpSignUp(phoneNumber, otpCode, lang);
      Alert.alert(
        "Registration Complete", 
        t("signup.otp.signupSuccess", lang),
        [{ text: "OK", onPress: () => router.replace("/home") }]
      );
    } catch (error) {
      const errMsg = error?.response?.data?.message || t("signup.otp.verifyFailed", lang);
      setOtpError(errMsg);
      Alert.alert("Failed", errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={[styles.overlay, { pointerEvents: "none" }]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
          {/* Language Selector */}
          <View style={styles.headerBar}>
            <Pressable
              onPress={() => setLang((prev) => (prev === "en" ? "ru" : "en"))}
              style={({ pressed }) => [styles.langSelector, pressed && styles.pressedMicro]}
            >
              <Feather name="globe" size={15} color="#FFF" />
              <Text style={styles.langSelectorText}>
                {lang === "en" ? "RU" : "EN"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.cardContainer}>
            {/* Logo */}
            <Image
              source={require("../../assets/logo_en.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Premium Signup Card */}
            <View style={styles.card}>
              {/* Tab Selector */}
              <View style={styles.tabToggleContainer}>
                <View style={styles.tabToggleBg}>
                  <Pressable
                    onPress={() => setActiveTab("email")}
                    style={[styles.tabButton, activeTab === "email" && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabButtonText, activeTab === "email" && styles.tabButtonTextActive]}>
                      {t("signup.tabs.email", lang)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setActiveTab("otp")}
                    style={[styles.tabButton, activeTab === "otp" && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabButtonText, activeTab === "otp" && styles.tabButtonTextActive]}>
                      {t("signup.tabs.otp", lang)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.title}>
                {activeTab === "email"
                  ? t("signup.createAccount", lang)
                  : t("signup.otp.title", lang)}
              </Text>
              <Text style={styles.subtitle}>
                {activeTab === "email"
                  ? t("signup.subtitle", lang)
                  : t("signup.otp.subtitle", lang)}
              </Text>

              {/* Email Form */}
              {activeTab === "email" ? (
                <View style={styles.form}>
                  <AppInput
                    label={t("signup.emailLabel", lang)}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder={t("signup.emailPlaceholder", lang)}
                    keyboardType="email-address"
                    leftIcon="mail"
                    error={emailError}
                  />

                  <AppInput
                    label={t("signup.passwordLabel", lang)}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t("signup.passwordPlaceholder", lang)}
                    secureTextEntry={!showPassword}
                    leftIcon="lock"
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />

                  {/* Password Strength Checklist Tags */}
                  {password.length > 0 && !isPasswordStrong && (
                    <View style={styles.criteriaGrid}>
                      <PasswordCriteria
                        label={t("signup.passwordLengthError", lang)}
                        met={isLenMet}
                      />
                      <PasswordCriteria
                        label={t("signup.passwordUppercaseError", lang)}
                        met={isUpperMet}
                      />
                      <PasswordCriteria
                        label={t("signup.passwordLowercaseError", lang)}
                        met={isLowerMet}
                      />
                      <PasswordCriteria
                        label={t("signup.passwordNumberError", lang)}
                        met={isNumMet}
                      />
                      <PasswordCriteria
                        label={t("signup.passwordSymbolError", lang)}
                        met={isSymbolMet}
                      />
                    </View>
                  )}

                  <AppInput
                    label={t("signup.confirmPasswordLabel", lang)}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder={t("signup.confirmPasswordPlaceholder", lang)}
                    secureTextEntry={!showConfirmPassword}
                    leftIcon="lock"
                    rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={confirmPasswordError}
                  />

                  {/* Submit button */}
                  <Pressable
                    onPress={handleSignUp}
                    disabled={isLoading || !isPasswordStrong || password !== confirmPassword}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.pressed,
                      (isLoading || !isPasswordStrong || password !== confirmPassword) && styles.buttonDisabled,
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {t("signup.signUpButton", lang)}  ›
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                /* OTP Form */
                <View style={styles.form}>
                  <PhoneInput
                    label={t("signup.otp.phoneLabel", lang)}
                    value={phoneNumber}
                    onChangeText={(val) => {
                      setPhoneNumber(val);
                      if (otpError) setOtpError("");
                    }}
                    placeholder="Enter number"
                    disabled={otpStep === "verify"}
                    error={otpStep === "send" ? otpError : null}
                  />

                  {otpStep === "send" ? (
                    <Pressable
                      onPress={handleSendOtp}
                      disabled={isLoading}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.pressed,
                        isLoading && styles.buttonDisabled,
                      ]}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <View style={styles.buttonWithIcon}>
                          <Feather name="send" size={15} color="#FFF" style={styles.btnIcon} />
                          <Text style={styles.primaryButtonText}>
                            {t("signup.otp.sendOtp", lang)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ) : (
                     <View style={{ gap: spacing.md }}>
                      <AppInput
                        label={t("signup.otp.otpLabel", lang)}
                        value={otpCode}
                        onChangeText={(val) => {
                          setOtpCode(val.replace(/\D/g, "").slice(0, 6));
                          if (otpError) setOtpError("");
                        }}
                        placeholder={t("signup.otp.otpPlaceholder", lang)}
                        keyboardType="number-pad"
                        leftIcon="key"
                        error={otpError}
                      />

                      <Pressable
                        onPress={handleVerifyOtp}
                        disabled={isLoading}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          pressed && styles.pressed,
                          isLoading && styles.buttonDisabled,
                        ]}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {t("signup.otp.register", lang)}
                          </Text>
                        )}
                      </Pressable>

                      {/* Action links */}
                      <View style={styles.rowBetween}>
                        <Pressable
                          onPress={() => {
                            setOtpStep("send");
                            setOtpCode("");
                            setOtpError("");
                          }}
                          style={styles.backToPhoneRow}
                        >
                          <Feather name="chevron-left" size={14} color="#6B7A90" />
                          <Text style={styles.backToPhoneText}>
                            {t("signup.otp.changeNumber", lang)}
                          </Text>
                        </Pressable>

                        <Pressable onPress={handleSendOtp}>
                          <Text style={styles.resendText}>
                            {t("signup.otp.resend", lang)}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t("signup.alreadyHaveAccount", lang)}{" "}
                </Text>
                <Link href="/sign-in" asChild>
                  <Pressable style={({ pressed }) => [pressed && styles.pressedMicro]}>
                    <Text style={styles.footerLinkBold}>
                      {t("signup.loginLink", lang)}
                    </Text>
                  </Pressable>
                </Link>
              </View>

              <Pressable
                onPress={() => router.replace("/intro")}
                style={({ pressed }) => [styles.backToHomeBtn, pressed && styles.pressedMicro]}
              >
                <Text style={styles.backToHomeText}>
                  {t("signin.backToHome", lang)}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 35, 63, 0.65)", 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  langSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    gap: 6,
  },
  langSelectorText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  logo: {
    width: 150,
    height: 70,
    marginBottom: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)", 
    borderRadius: 30, 
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.15,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 10px 25px rgba(15, 76, 129, 0.15)",
      },
    }),
  },
  tabToggleContainer: {
    alignItems: "center",
    marginBottom: 26,
  },
  tabToggleBg: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 30,
    padding: 4,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 3px 6px rgba(15, 76, 129, 0.08)",
      },
    }),
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tabButtonTextActive: {
    color: "#0F4C81",
    fontWeight: "800",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#10233F",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7A90",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  criteriaGrid: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  criteriaText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1, 
    lineHeight: 16,
  },
  criteriaTextMet: {
    color: "#1E9E6A",
    fontWeight: "700",
  },
  criteriaTextUnmet: {
    color: "#64748B",
  },
  primaryButton: {
    backgroundColor: "#0F4C81",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#0F4C81",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 6px 12px rgba(15, 76, 129, 0.25)",
      },
    }),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
      },
      android: {
        elevation: 0,
      },
      web: {
        boxShadow: "none",
      },
    }),
  },
  buttonWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnIcon: {
    marginTop: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }], 
  },
  pressedMicro: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  backToPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backToPhoneText: {
    fontSize: 13,
    color: "#6B7A90",
    fontWeight: "700",
  },
  resendText: {
    fontSize: 13,
    color: "#1E9E6A",
    fontWeight: "800",
    paddingVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7A90",
    fontWeight: "500",
  },
  footerLinkBold: {
    fontSize: 14,
    fontWeight: "800",
    color: "#10233F",
    textDecorationLine: "underline",
  },
  backToHomeBtn: {
    alignSelf: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  backToHomeText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
