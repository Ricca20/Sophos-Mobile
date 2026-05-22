import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { SectionHeader } from "@/components/SectionHeader";
import { meetingService } from "@/features/meetings/meetingService";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function MeetingScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const result = await meetingService.joinByUser({
        roomId,
        userEmail: user?.email,
        role: user?.role,
        name: user?.name ?? user?.email,
      });

      if (result.joinUrl) {
        await Linking.openURL(result.joinUrl);
      } else {
        Alert.alert("Meeting ready", "The backend returned a room token but no join URL.");
      }
    } catch (error) {
      Alert.alert("Meeting error", error instanceof Error ? error.message : "Unable to join meeting.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Screen>
      <SectionHeader title="Meeting room" subtitle="This screen will connect to the PlugNmeet backend flow from the existing project." />
      <AppCard>
        <View style={styles.block}>
          <Text style={styles.label}>Room ID</Text>
          <Text style={styles.value}>{roomId}</Text>
          <AppButton title={isJoining ? "Joining..." : "Join meeting"} onPress={handleJoin} />
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
});
