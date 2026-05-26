import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { t } from "@/utils/i18n";
import { PhoneInput } from "@/components/PhoneInput";

// Form Input Component with Focus States
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isFocused && styles.inputLabelFocused, error && styles.inputLabelError]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && (
          <Feather
            name={leftIcon}
            size={18}
            color={error ? "#EF4444" : isFocused ? "#0F4C81" : "#6B7A90"}
            style={styles.inputLeftIcon}
            pointerEvents="none"
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.inputField,
            leftIcon ? { paddingLeft: 44 } : null,
            rightIcon ? { paddingRight: 44 } : null,
          ]}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Feather
              name={rightIcon}
              size={18}
              color={isFocused ? "#0F4C81" : "#6B7A90"}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
};

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, sendOtp, verifyOtpSignIn, language: lang, changeLanguage } = useAuth();
  
  const [activeTab, setActiveTab] = useState("email"); // "email" | "otp"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState("send"); 
  const [otpError, setOtpError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Reset states when changing tab
  useEffect(() => {
    setEmail("");
    setPassword("");
    setEmailError("");
    setPhoneNumber("");
    setOtpCode("");
    setOtpStep("send");
    setOtpError("");
  }, [activeTab]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !emailRegex.test(val)) {
      setEmailError(t("signin.errors.email", lang));
    } else {
      setEmailError("");
    }
  };

  const handleSignIn = async () => {
    if (!emailRegex.test(email) || !password) {
      Alert.alert(t("signin.errors.login", lang), t("signin.errors.form", lang));
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password, lang);
      router.replace("/home");
    } catch (error) {
      console.warn("Sign In Error:", error);
      const isInvalid = error?.response?.status === 401;
      Alert.alert(
        t("signin.errors.login", lang), 
        isInvalid ? t("signin.errors.invalidCredentials", lang) : (error?.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setOtpError(t("signin.otp.phoneRequired", lang));
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setOtpError(t("signin.otp.invalidPhone", lang));
      return;
    }
    
    setIsSubmitting(true);
    setOtpError("");
    try {
      await sendOtp(phoneNumber);
      Alert.alert("OTP Sent", t("signin.otp.otpSent", lang));
      setOtpStep("verify");
      setOtpCode("");
    } catch (error) {
      const errMsg = error?.response?.data?.message || t("signin.otp.sendFailed", lang);
      setOtpError(errMsg);
      Alert.alert("Failed", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpError(t("signin.otp.otpRequired", lang));
      return;
    }
    if (!/^\d{4,6}$/.test(otpCode)) {
      setOtpError(t("signin.otp.invalidOtp", lang));
      return;
    }

    setIsSubmitting(true);
    setOtpError("");
    try {
      await verifyOtpSignIn(phoneNumber, otpCode, lang);
      router.replace("/home");
    } catch (error) {
      const errMsg = error?.response?.data?.message || t("signin.otp.verifyFailed", lang);
      setOtpError(errMsg);
      Alert.alert("Failed", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={styles.overlay} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
          {/* Language Selector */}
          <View style={styles.headerBar}>
            <Pressable
              onPress={() => changeLanguage(lang === "en" ? "ru" : "en")}
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

            {/* Premium Auth Card */}
            <View style={styles.card}>
              {/* Tab Toggle */}
              <View style={styles.tabToggleContainer}>
                <View style={styles.tabToggleBg}>
                  <Pressable
                    onPress={() => setActiveTab("email")}
                    style={[styles.tabButton, activeTab === "email" && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabButtonText, activeTab === "email" && styles.tabButtonTextActive]}>
                      {t("signin.tabs.email", lang)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setActiveTab("otp")}
                    style={[styles.tabButton, activeTab === "otp" && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabButtonText, activeTab === "otp" && styles.tabButtonTextActive]}>
                      {t("signin.tabs.otp", lang)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.title}>
                {activeTab === "email"
                  ? t("signin.title", lang)
                  : t("signin.otp.title", lang)}
              </Text>
              <Text style={styles.subtitle}>
                {activeTab === "email"
                  ? t("signin.subtitle", lang)
                  : t("signin.otp.subtitle", lang)}
              </Text>

              {/* Email Form */}
              {activeTab === "email" ? (
                <View style={styles.form}>
                  <FormInput
                    label={t("signin.emailLabel", lang)}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder={t("signin.emailPlaceholder", lang)}
                    keyboardType="email-address"
                    leftIcon="mail"
                    error={emailError}
                  />

                  <FormInput
                    label={t("signin.passwordLabel", lang)}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t("signin.passwordPlaceholder", lang)}
                    secureTextEntry={!showPassword}
                    leftIcon="lock"
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />

                  {/* Remember Me and Forgot Password */}
                  <View style={styles.rowBetween}>
                    <Pressable
                      style={styles.checkboxRow}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <Ionicons
                        name={rememberMe ? "checkbox" : "square-outline"}
                        size={20}
                        color={rememberMe ? "#0F4C81" : "#94A3B8"}
                      />
                      <Text style={styles.checkboxLabel}>
                        {t("signin.rememberMe", lang)}
                      </Text>
                    </Pressable>

                    <Link href="/forgot-password" asChild>
                      <Pressable style={({ pressed }) => [pressed && styles.pressedMicro]}>
                        <Text style={styles.forgotLink}>
                          {t("signin.forgotPassword", lang)}
                        </Text>
                      </Pressable>
                    </Link>
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSignIn}
                    disabled={isSubmitting}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.pressed,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {t("signin.login", lang)}  ›
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                /* OTP Form */
                <View style={styles.form}>
                  <PhoneInput
                    label={t("signin.otp.phoneLabel", lang)}
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
                      disabled={isSubmitting}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.pressed,
                        isSubmitting && styles.buttonDisabled,
                      ]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <View style={styles.buttonWithIcon}>
                          <Feather name="send" size={15} color="#FFF" style={styles.btnIcon} />
                          <Text style={styles.primaryButtonText}>
                            {t("signin.otp.sendOtp", lang)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ) : (
                    <View style={{ gap: spacing.md }}>
                      <FormInput
                        label={t("signin.otp.otpLabel", lang)}
                        value={otpCode}
                        onChangeText={(val) => {
                          setOtpCode(val.replace(/\D/g, "").slice(0, 6));
                          if (otpError) setOtpError("");
                        }}
                        placeholder={t("signin.otp.otpPlaceholder", lang)}
                        keyboardType="number-pad"
                        leftIcon="key"
                        error={otpError}
                      />

                      <Pressable
                        onPress={handleVerifyOtp}
                        disabled={isSubmitting}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          pressed && styles.pressed,
                          isSubmitting && styles.buttonDisabled,
                        ]}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {t("signin.otp.verify", lang)}
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
                            {t("signin.otp.changeNumber", lang)}
                          </Text>
                        </Pressable>

                        <Pressable onPress={handleSendOtp}>
                          <Text style={styles.resendText}>
                            {t("signin.otp.resend", lang)}
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
                  {t("signin.footerText", lang)}{" "}
                </Text>
                <Link href="/sign-up" asChild>
                  <Pressable style={({ pressed }) => [pressed && styles.pressedMicro]}>
                    <Text style={styles.footerLinkBold}>
                      {t("signin.footerLink", lang)}
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
    shadowColor: "#0F4C81",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
    shadowColor: "#0F4C81",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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
    gap: 18,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 2,
  },
  inputLabelFocused: {
    color: "#0F4C81",
  },
  inputLabelError: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    height: 54,
    position: "relative",
    shadowColor: "transparent",
  },
  inputWrapperFocused: {
    borderColor: "#0F4C81",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F4C81",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  inputLeftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  inputRightIcon: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#10233F",
    paddingHorizontal: 18,
    fontWeight: "600",
  },
  inputErrorText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
    marginTop: 2,
    paddingLeft: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F4C81",
  },
  primaryButton: {
    backgroundColor: "#0F4C81",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#0F4C81",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
    shadowColor: "transparent",
    elevation: 0,
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
    marginTop: 26,
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
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backToHomeText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
