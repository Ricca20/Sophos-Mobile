import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export const SectionHeader = ({
  title,
  subtitle,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
