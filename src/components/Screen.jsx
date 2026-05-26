import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/utils/i18n";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const Screen = ({
  children,
  scroll = true,
  preventProfileBlock = false,
}) => {
  const router = useRouter();
  const { user, language } = useAuth();
  const Container = scroll ? ScrollView : View;

  const shouldBlock = user && user.profileCompleted === false && !preventProfileBlock;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.outerContainer}>
        {/* Screen Content */}
        <Container
          pointerEvents={shouldBlock ? "none" : "auto"}
          contentContainerStyle={scroll ? styles.scrollContent : undefined}
          style={[
            styles.container,
            shouldBlock && styles.containerBlocked,
          ]}
        >
          {children}
        </Container>

        {/* Profile Blocker Overlay */}
        {shouldBlock && (
          <View style={styles.blockOverlay}>
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>
                {t("profile_popup.title", language)}
              </Text>
              <Text style={styles.blockMessage}>
                {t("profile_popup.message", language)}
              </Text>
              <Pressable
                onPress={() => router.push("/profile")}
                style={({ pressed }) => [
                  styles.blockButton,
                  pressed && styles.blockButtonPressed,
                ]}
              >
                <Text style={styles.blockButtonText}>
                  {t("profile_popup.button", language)}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerBlocked: {
    opacity: 0.35, // Blurs/diminishes layout
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  blockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Web-matching overlay background
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,
  },
  blockCard: {
    width: "90%",
    maxWidth: 400, // Web-matching max-width
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // High-quality rounded card matching mobile feel and web style
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
      },
    }),
  },
  blockTitle: {
    fontSize: 26,
    fontWeight: "500", // Soft, clean weight matching the image
    color: "#000000", // Pure black for high visibility and exact matching
    textAlign: "center",
    marginBottom: 12,
  },
  blockMessage: {
    fontSize: 16,
    color: "#374151", // Standard neutral dark gray matching the image description
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  blockButton: {
    backgroundColor: "#007bff", // Exact vibrant blue from the web app primary/image
    borderRadius: 6, // Clean, subtle rounding matching the button in the image
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
      },
      default: {
        shadowColor: "#007bff",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      },
    }),
  },
  blockButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  blockButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
