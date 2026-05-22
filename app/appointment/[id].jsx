import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { appointmentService } from "@/features/appointments/appointmentService";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const appointmentId = Array.isArray(id) ? id[0] : id;
  const appointmentQuery = useQuery({ queryKey: ["appointment", appointmentId], queryFn: () => appointmentService.getById(appointmentId), enabled: Boolean(appointmentId) });

  return (
    <Screen>
      <SectionHeader title="Appointment details" subtitle="A mobile-friendly view for the same application records used by the web portal." />
      {appointmentQuery.isLoading ? (
        <EmptyState title="Loading appointment" message="Fetching appointment details." />
      ) : appointmentQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load this appointment." actionLabel="Retry" onAction={() => appointmentQuery.refetch()} />
      ) : (
        <AppCard>
          <View style={styles.block}>
            <Text style={styles.title}>{appointmentQuery.data?.applicationId ?? appointmentId}</Text>
            <Text style={styles.meta}>Date: {appointmentQuery.data?.date ?? "Not set"}</Text>
            <Text style={styles.meta}>Status: {appointmentQuery.data?.status ?? "Pending"}</Text>
          </View>
        </AppCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    color: colors.muted,
  },
});
