import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/services/api";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      Alert.alert("Check your inbox", "If the account exists, a reset link will be sent.");
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Unable to request a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Reset password"
        subtitle="We will call the backend reset flow used by the current patient portal."
      />

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="patient@example.com" keyboardType="email-address" />
          <AppButton title={isSubmitting ? "Sending..." : "Send reset link"} onPress={handleSubmit} />
        </View>
      </AppCard>

      <Link href="/sign-in" style={styles.link}>Back to sign in</Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    alignSelf: "center",
  },
});
