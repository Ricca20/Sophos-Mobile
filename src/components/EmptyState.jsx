import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction ? <AppButton title={actionLabel} onPress={onAction} /> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
});
