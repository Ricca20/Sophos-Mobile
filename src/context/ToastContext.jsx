import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Pressable, Platform, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const translateY = useRef(new Animated.Value(-150)).current;
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [translateY]);

  const showToast = useCallback((message, type = "success") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, type, visible: true });

    // Animate in
    Animated.spring(translateY, {
      toValue: 0,
      friction: 8,
      tension: 50,
      useNativeDriver: Platform.OS !== "web",
    }).start();

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  }, [translateY, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <Pressable
              onPress={hideToast}
              style={[
                styles.toastContent,
                toast.type === "success" && styles.successBorder,
                toast.type === "error" && styles.errorBorder,
                toast.type === "info" && styles.infoBorder,
              ]}
            >
              <View style={styles.iconWrapper}>
                {toast.type === "success" && <Feather name="check-circle" size={18} color="#10B981" />}
                {toast.type === "error" && <Feather name="alert-circle" size={18} color="#EF4444" />}
                {toast.type === "info" && <Feather name="info" size={18} color="#3B82F6" />}
              </View>
              <Text style={styles.toastText}>{toast.message}</Text>
              <Feather name="x" size={14} color="#94A3B8" style={styles.closeIcon} />
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    ...Platform.select({
      web: {
        position: "fixed",
      },
    }),
  },
  safeArea: {
    width: "100%",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 10 : 24,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10192C",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "90%",
    maxWidth: 400,
    borderWidth: 1.5,
    borderColor: "#1E293B",
    ...Platform.select({
      web: {
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successBorder: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "#0B1D1A",
  },
  errorBorder: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "#201315",
  },
  infoBorder: {
    borderColor: "rgba(59, 130, 246, 0.4)",
    backgroundColor: "#0F182A",
  },
  iconWrapper: {
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#F8FAFC",
    lineHeight: 18,
  },
  closeIcon: {
    marginLeft: 10,
  },
});
