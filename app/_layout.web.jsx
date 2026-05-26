import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { View, StyleSheet } from "react-native";

const queryClient = new QueryClient();

export default function RootLayoutWeb() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <View style={styles.page}>
              <View style={[styles.frame, styles.frameShadow]}>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
              </View>
            </View>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#090d16", 
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  frame: {
    width: 412,
    height: 915,
    backgroundColor: "transparent", 
    borderRadius: 0, 
    overflow: "hidden",
    position: "relative", 
    zIndex: 1,
  },
  frameShadow: {
    boxShadow: "0 20px 60px rgba(9,13,22,0.6)",
  },
});
