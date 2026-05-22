import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { doctorService } from "@/features/doctors/doctorService";
import { colors } from "@/theme/colors";

export default function DoctorsScreen() {
  const router = useRouter();
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: () => doctorService.list() });

  return (
    <Screen>
      <SectionHeader title="Doctors" subtitle="The list mirrors the web portal doctor directory and uses the same API endpoint." />
      {doctorsQuery.isLoading ? (
        <EmptyState title="Loading doctors" message="Fetching doctor profiles from the backend." />
      ) : doctorsQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load doctors right now." actionLabel="Retry" onAction={() => doctorsQuery.refetch()} />
      ) : (
        <FlatList
          data={doctorsQuery.data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AppCard>
              <Pressable onPress={() => router.push(`/doctor/${item._id}`)}>
                <Text style={styles.name}>{item.fullName?.en ?? item.firstName?.en ?? "Doctor"}</Text>
                <Text style={styles.specialty}>{item.specialtyIds?.map((item) => item.name?.en).filter(Boolean).join(", ") || "General medicine"}</Text>
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
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  specialty: {
    marginTop: 6,
    color: colors.muted,
  },
});
