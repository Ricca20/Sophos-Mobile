import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { AppCard } from "@/components/AppCard";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { doctorService } from "@/features/doctors/doctorService";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const shortcuts = [
  { label: "Book", href: "/appointments" },
  { label: "Doctors", href: "/doctors" },
  { label: "Meetings", href: "/meeting/demo-room" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: () => doctorService.list() });

  const featuredDoctors = useMemo(() => doctorsQuery.data?.slice(0, 3) ?? [], [doctorsQuery.data]);

  return (
    <Screen>
      <SectionHeader
        title={`Welcome${user?.email ? `, ${user.email}` : ""}`}
        subtitle="This mobile shell follows the same patient, doctor, appointment, and meeting flows as the web app."
      />

      <AppCard>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Fast access to care</Text>
          <Text style={styles.heroText}>Use this app to explore doctors, appointments, notifications, and telemedicine entries.</Text>
          <AppButton title="Open doctors" onPress={() => router.push("/doctors")} />
        </View>
      </AppCard>

      <View style={styles.shortcutRow}>
        {shortcuts.map((item) => (
          <Pressable key={item.href} style={styles.shortcutCard} onPress={() => router.push(item.href as never)}>
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Featured doctors" subtitle="Pulled from the backend `/api/doctors` endpoint." />
      {doctorsQuery.isLoading ? (
        <EmptyState title="Loading doctors" message="Fetching the doctor list from the backend..." />
      ) : doctorsQuery.isError ? (
        <EmptyState title="Unable to load doctors" message="Check the API base URL and backend availability." actionLabel="Retry" onAction={() => doctorsQuery.refetch()} />
      ) : (
        <FlatList
          data={featuredDoctors}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <AppCard>
              <Pressable onPress={() => router.push(`/doctor/${item._id}`)}>
                <Text style={styles.cardTitle}>{item.fullName?.en ?? item.firstName?.en ?? "Doctor"}</Text>
                <Text style={styles.cardText}>{item.specialtyIds?.map((specialty) => specialty.name?.en).filter(Boolean).join(", ") || "Specialist"}</Text>
              </Pressable>
            </AppCard>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  heroText: {
    color: colors.muted,
    lineHeight: 20,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  shortcutCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutLabel: {
    textAlign: "center",
    fontWeight: "800",
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  cardText: {
    marginTop: 4,
    color: colors.muted,
  },
});
