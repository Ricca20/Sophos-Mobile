import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export const LoadingScreen = () => {
  const pulse = useRef(new Animated.Value(0.92)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    floatAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
    };
  }, [pulse, floatY]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View
        style={[
          {
            transform: [
              { scale: pulse },
              { translateY: floatY },
              { perspective: 900 },
              { rotateX: "6deg" },
            ],
          },
        ]}
      >
        <Image
          source={require("../../assets/logo_en.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBFF",
    padding: 24,
  },
  logo: {
    width: 180,
    height: 180,
  },
  
});
