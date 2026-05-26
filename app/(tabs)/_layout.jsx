import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import {
  MaterialIcons,
  FontAwesome5
} from "@expo/vector-icons";
import { HeartHandshake } from "lucide-react-native";

const TabIcon = ({ focused, name }) => {
  const color = focused ? "#FFFFFF" : "#9CA3AF";
  const size = focused ? 22 : 24;

  let iconComponent = null;
  switch (name) {
    case "home":
      iconComponent = <MaterialIcons name="dashboard" color={color} size={size} />;
      break;
    case "doctors":
      iconComponent = <FontAwesome5 name="user-md" color={color} size={size} />;
      break;
    case "specialist":
      iconComponent = <FontAwesome5 name="plus" color={color} size={size} />;
      break;
    case "appointments":
      iconComponent = <FontAwesome5 name="calendar-plus" color={color} size={size} />;
      break;
    case "notifications":
      iconComponent = <HeartHandshake color={color} size={size} strokeWidth={2.2} />;
      break;
    case "profile":
      iconComponent = <FontAwesome5 name="user-circle" color={color} size={size} />;
      break;
  }

  if (focused) {
    return (
      <View style={styles.activeIconShell}>
        {iconComponent}
      </View>
    );
  }

  return (
    <View style={styles.inactiveIconShell}>
      {iconComponent}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0d3881",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 6,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 48,
          width: 48,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        },
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: Platform.OS === "ios" ? 90 : 80,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          borderWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 18 : 8,
          ...Platform.select({
            web: {
              boxShadow: "0 -8px 24px rgba(15, 76, 129, 0.08)",
              outlineStyle: "none",
            },
            default: {
              shadowColor: "#0F4C81",
              shadowOpacity: 0.08,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -4 },
              elevation: 8,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="doctors"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="specialist"
        options={{
          title: "Specialist",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="specialist"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Book Appointments",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="appointments"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Early Detection",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="notifications"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name="profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconShell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0d3881",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 25px rgba(13, 56, 129, 0.5)",
      },
      default: {
        shadowColor: "#0D3881",
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      },
    }),
  },
  inactiveIconShell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
