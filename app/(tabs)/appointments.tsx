import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { appointmentService } from "@/features/appointments/appointmentService";
import { colors } from "@/theme/colors";

export default function AppointmentsScreen() {
  const router = useRouter();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: () => appointmentService.list() });

  return (
    <Screen>
      <SectionHeader title="Appointments" subtitle="Application records from the web app are shown here as a mobile entry point." />
      {appointmentsQuery.isLoading ? (
        <EmptyState title="Loading appointments" message="Fetching application records from the backend." />
      ) : appointmentsQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load appointments." actionLabel="Retry" onAction={() => appointmentsQuery.refetch()} />
      ) : (
        <FlatList
          data={appointmentsQuery.data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AppCard>
              <Pressable onPress={() => router.push(`/appointment/${item._id}`)}>
                <Text style={styles.id}>{item.applicationId ?? item._id}</Text>
                <Text style={styles.meta}>{item.date ?? "No date yet"}</Text>
                <Text style={styles.meta}>{item.status ?? "Pending"}</Text>
              </Pressable>
            </AppCard>
          )}
          ItemSeparatorComponent={() => <Text style={{ height: 12 }} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  id: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    marginTop: 6,
    color: colors.muted,
  },
});
