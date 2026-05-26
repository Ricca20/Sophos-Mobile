import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { doctorService } from "@/features/doctors/doctorService";
import { colors } from "@/theme/colors";

export default function DoctorsScreen() {
  const router = useRouter();
  const { specialtyId, specialtyName } = useLocalSearchParams();
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: () => doctorService.list() });

  const filteredDoctors = useMemo(() => {
    const doctors = doctorsQuery.data ?? [];
    if (!specialtyId) return doctors;
    return doctors.filter((doc) =>
      doc.specialtyIds?.some((spec) => spec._id === specialtyId)
    );
  }, [doctorsQuery.data, specialtyId]);

  return (
    <Screen>
      <SectionHeader title="Doctors" subtitle="The list mirrors the web portal doctor directory and uses the same API endpoint." />
      
      {specialtyName ? (
        <View style={styles.filterBadge}>
          <Text style={styles.filterText}>Filtering: {specialtyName}</Text>
          <Pressable
            onPress={() => router.setParams({ specialtyId: "", specialtyName: "" })}
            style={styles.clearFilter}
          >
            <Feather name="x" size={14} color="#0F4C81" />
          </Pressable>
        </View>
      ) : null}

      {doctorsQuery.isLoading ? (
        <EmptyState title="Loading doctors" message="Fetching doctor profiles from the backend." />
      ) : doctorsQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load doctors right now." actionLabel="Retry" onAction={() => doctorsQuery.refetch()} />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState title="No doctors found" message="No doctors match the selected specialty." />
      ) : (
        <FlatList
          data={filteredDoctors}
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
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 76, 129, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F4C81",
    marginRight: 8,
  },
  clearFilter: {
    padding: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
});
