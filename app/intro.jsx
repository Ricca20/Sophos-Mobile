import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const highlights = [
  "Secure patient records",
  "Book appointments fast",
  "Stay connected with your care team",
];

export default function Intro() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.content}>
        <View style={styles.headerStack}>
          <Image
            source={require("../assets/logo_en.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.title}>
            Your Partner in{"\n"}Personalized Health
          </Text>

          <Text style={styles.subtitle}>
            Access your records and connect with your care team in one secure place. We support every step of your health journey.
          </Text>

          <View style={styles.highlights}>
            {highlights.map((item) => (
              <View key={item} style={styles.highlightItem}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-in")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-up")}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Register</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(0, 40, 92, 0.08)",
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -120,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(15, 76, 129, 0.08)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerStack: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  logo: {
    width: 136,
    height: 136,
  },
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(0, 40, 92, 0.08)",
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#00285c",
        shadowOpacity: 0.08,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 10px 24px rgba(0, 40, 92, 0.08)",
      },
    }),
  },
  title: {
    color: "#10233F",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
    alignItems: "center",
    textAlign: "left",
    maxWidth: 520,
  },
  subtitle: {
    color: colors.muted,
    textAlign: "left",
    maxWidth: 560,
    fontSize: 16,
    lineHeight: 24,
  },
  highlights: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#00285c",
  },
  highlightText: {
    color: "#10233F",
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00285c",
    ...Platform.select({
      ios: {
        shadowColor: "#00285c",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 8px 12px rgba(0, 40, 92, 0.18)",
      },
    }),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#00285c",
  },
  secondaryButtonText: {
    color: "#00285c",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
