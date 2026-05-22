import { FlatList, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { notificationService } from "@/features/notifications/notificationService";
import { colors } from "@/theme/colors";

export default function NotificationsScreen() {
  const notificationsQuery = useQuery({ queryKey: ["common-notifications"], queryFn: () => notificationService.listCommon() });

  return (
    <Screen>
      <SectionHeader title="Notifications" subtitle="Common notifications are shared across the app just like in the web portal." />
      {notificationsQuery.isLoading ? (
        <EmptyState title="Loading notifications" message="Fetching announcements from the backend." />
      ) : notificationsQuery.isError ? (
        <EmptyState title="Load failed" message="Could not load notifications." actionLabel="Retry" onAction={() => notificationsQuery.refetch()} />
      ) : (
        <FlatList
          data={notificationsQuery.data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AppCard>
              <Text style={styles.title}>{item.title ?? item.type ?? "Notification"}</Text>
              <Text style={styles.message}>{typeof item.message === "string" ? item.message : item.message?.en ?? item.message?.ru ?? ""}</Text>
            </AppCard>
          )}
          ItemSeparatorComponent={() => <Text style={{ height: 12 }} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  message: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 20,
  },
});
