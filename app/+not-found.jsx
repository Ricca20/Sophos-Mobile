import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { SectionHeader } from "@/components/SectionHeader";

export default function NotFound() {
  const router = useRouter();

  return (
    <Screen>
      <SectionHeader
        title="Page not found"
        subtitle="The screen you opened is not part of the current Sophos Mobile scaffold."
      />
      <AppButton title="Go to home" onPress={() => router.replace("/home")} />
    </Screen>
  );
}
