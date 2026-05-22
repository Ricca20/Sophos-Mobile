import { useQuery } from "@tanstack/react-query";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { AppCard } from "@/components/AppCard";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/features/profile/profileService";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => profileService.getProfile() });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Sign out failed", error instanceof Error ? error.message : "Unable to sign out.");
    }
  };

  return (
    <Screen>
      <SectionHeader title="Profile" subtitle="This is the mobile entry point for the patient profile used in the existing portal." />
      <AppCard>
        <View style={styles.block}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? "Unknown user"}</Text>
          <Text style={styles.subvalue}>Role: {user?.role ?? "patient"}</Text>
        </View>
      </AppCard>

      {profileQuery.isLoading ? (
        <EmptyState title="Loading profile" message="Fetching patient profile from the backend." />
      ) : profileQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load profile data." actionLabel="Retry" onAction={() => profileQuery.refetch()} />
      ) : (
        <AppCard>
          <View style={styles.block}>
            <Text style={styles.label}>Patient ID</Text>
            <Text style={styles.value}>{profileQuery.data?.patientId ?? "Not set"}</Text>
            <Text style={styles.subvalue}>{profileQuery.data?.notificationLanguage?.toUpperCase() ?? "EN"}</Text>
          </View>
        </AppCard>
      )}

      <AppButton title="Sign out" variant="secondary" onPress={handleSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  subvalue: {
    color: colors.muted,
  },
});
