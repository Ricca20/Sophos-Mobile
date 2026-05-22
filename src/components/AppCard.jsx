import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const AppCard = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0A2540",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 2,
  },
});
