import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "sophos_mobile_device_id";

/**
 * Gets a persistent, unique device ID. If one doesn't exist, it creates and stores it.
 */
export const getCurrentDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `mob_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `mob_${Date.now()}`;
  }
};

/**
 * Builds the deviceInfo payload expected by the backend for authentication endpoints.
 */
export const buildDeviceInfo = async () => {
  const deviceId = await getCurrentDeviceId();
  const model = Device.modelName || "Device";
  const osName = Device.osName || Platform.OS;
  const osVersion = Device.osVersion || "";
  
  const userAgent = `${model} (${osName} ${osVersion})`;
  const platform = Platform.OS; // 'ios' or 'android' or 'web'
  const browser = Platform.OS === "web" ? "Browser" : "NativeApp";
  const os = osName;
  const deviceType = Device.deviceType === 2 ? "tablet" : Device.deviceType === 1 ? "mobile" : "desktop";
  const location = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    deviceId,
    userAgent,
    platform,
    browser,
    os,
    deviceType,
    location,
  };
};
