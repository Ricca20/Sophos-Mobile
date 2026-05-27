import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/utils/i18n";
import { AppInput } from "@/components/AppInput";


export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordResetEmail, language: lang, changeLanguage } = useAuth();
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !emailRegex.test(val)) {
      setEmailError(t("forgotPassword.errors.emailRequired", lang));
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async () => {
    if (!emailRegex.test(email)) {
      setEmailError(t("forgotPassword.errors.emailRequired", lang));
      return;
    }
    
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim().toLowerCase(), lang);
      setIsSent(true);
    } catch (error) {
      Alert.alert(
        t("forgotPassword.title", lang),
        error?.response?.data?.message || t("forgotPassword.errors.general", lang)
      );
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
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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

            {/* Premium Forgot Card */}
            <View style={styles.card}>
              {!isSent ? (
                <>
                  <Text style={styles.title}>
                    {t("forgotPassword.title", lang)}
                  </Text>
                  <Text style={styles.subtitle}>
                    {t("forgotPassword.instructions", lang)}
                  </Text>

                  <View style={styles.form}>
                    <AppInput
                      label={t("signin.emailLabel", lang)}
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder={t("signin.emailPlaceholder", lang)}
                      keyboardType="email-address"
                      leftIcon="mail"
                      error={emailError}
                    />

                    <View style={styles.btnRow}>
                      <Pressable
                        onPress={() => router.replace("/sign-in")}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {t("forgotPassword.back", lang)}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={handleSubmit}
                        disabled={isSubmitting || !emailRegex.test(email)}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          pressed && styles.pressed,
                          (isSubmitting || !emailRegex.test(email)) && styles.buttonDisabled,
                        ]}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {t("forgotPassword.send", lang)}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : (
                /* Success View */
                <View style={styles.successContainer}>
                  <View style={styles.checkWrapper}>
                    <Ionicons name="checkmark" size={32} color="#1E9E6A" />
                  </View>

                  <Text style={styles.title}>
                    {t("forgotPassword.success.title", lang)}
                  </Text>
                  <Text style={styles.successMessage}>
                    {t("forgotPassword.success.message", lang).replace("{email}", email)}
                  </Text>
                  <Text style={styles.successNote}>
                    {t("forgotPassword.success.note", lang)}
                  </Text>

                  <Pressable
                    onPress={() => router.replace("/sign-in")}
                    style={({ pressed }) => [styles.fullWidthButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {t("forgotPassword.backToLogin", lang)}
                    </Text>
                  </Pressable>
                </View>
              )}
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
    marginTop: 30,
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
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1.2,
    backgroundColor: "#0F4C81",
    borderRadius: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  pressedMicro: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  checkWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A3E635",
  },
  successMessage: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginVertical: 10,
    fontWeight: "600",
  },
  successNote: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  fullWidthButton: {
    width: "100%",
    backgroundColor: "#0F4C81",
    borderRadius: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
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
});
