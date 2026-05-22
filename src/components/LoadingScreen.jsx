import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export const LoadingScreen = ({ label = "Loading Sophos Mobile..." }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.muted,
    fontWeight: "600",
  },
});
