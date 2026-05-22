import type { ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const Screen = ({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) => {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Container
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
        style={styles.container}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
});
