import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const router = useRouter();
  const { isBootstrapping } = useAuth();
  const [readyToRoute, setReadyToRoute] = useState(false);

  useEffect(() => {
    if (isBootstrapping) {
      return undefined;
    }

    setReadyToRoute(false);
    const timer = setTimeout(() => {
      setReadyToRoute(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isBootstrapping]);

  useEffect(() => {
    if (readyToRoute) {
      router.replace("/intro");
    }
  }, [readyToRoute, router]);

  return (
    <LoadingScreen />
  );
}
