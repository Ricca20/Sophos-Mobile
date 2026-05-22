import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Sign in failed", error instanceof Error ? error.message : "Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>Sophos Mobile</Text>
        <SectionHeader
          title="Sign in"
          subtitle="Use the same patient account you already have in Health Direct."
        />
      </View>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="patient@example.com" keyboardType="email-address" />
          <AppInput label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
          <AppButton title={isSubmitting ? "Signing in..." : "Sign in"} onPress={handleSubmit} />
          <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
        </View>
      </AppCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New here?</Text>
        <Link href="/sign-up" style={styles.link}>Create account</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
  },
  brand: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
    textTransform: "uppercase",
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  footerText: {
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
  },
});
