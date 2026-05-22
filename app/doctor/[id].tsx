import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { doctorService } from "@/features/doctors/doctorService";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function DoctorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctorQuery = useQuery({ queryKey: ["doctor", id], queryFn: () => doctorService.getById(id), enabled: Boolean(id) });

  return (
    <Screen>
      <SectionHeader title="Doctor profile" subtitle="Mobile details for the doctor selected from the shared backend." />
      {doctorQuery.isLoading ? (
        <EmptyState title="Loading doctor" message="Fetching the doctor profile." />
      ) : doctorQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load this doctor right now." actionLabel="Retry" onAction={() => doctorQuery.refetch()} />
      ) : (
        <AppCard>
          <View style={styles.block}>
            <Text style={styles.name}>{doctorQuery.data?.fullName?.en ?? doctorQuery.data?.firstName?.en ?? "Doctor"}</Text>
            <Text style={styles.meta}>ID: {doctorQuery.data?._id ?? id}</Text>
            <Text style={styles.meta}>{doctorQuery.data?.specialtyIds?.map((item) => item.name?.en).filter(Boolean).join(", ") || "Specialist"}</Text>
            <AppButton
              title="Book appointment"
              onPress={() => {
                Alert.alert("Next step", "Connect this action to the booking flow once appointment creation is added to the mobile app.");
                router.push("/appointments");
              }}
            />
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
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    lineHeight: 20,
  },
});
