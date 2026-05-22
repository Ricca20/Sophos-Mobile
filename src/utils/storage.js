import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "sophos_access_token";
const REFRESH_TOKEN_KEY = "sophos_refresh_token";
const USER_KEY = "sophos_user";

const canUseSecureStore = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

const writeToken = async (key, value) => {
  const secureAvailable = await canUseSecureStore();

  if (value) {
    if (secureAvailable) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
    return;
  }

  if (secureAvailable) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  await AsyncStorage.removeItem(key);
};

const readToken = async (key) => {
  const secureAvailable = await canUseSecureStore();
  if (secureAvailable) {
    return SecureStore.getItemAsync(key);
  }

  return AsyncStorage.getItem(key);
};

export const sessionStorage = {
  async saveAccessToken(token) {
    await writeToken(ACCESS_TOKEN_KEY, token);
  },
  async saveRefreshToken(token) {
    await writeToken(REFRESH_TOKEN_KEY, token);
  },
  async getAccessToken() {
    return readToken(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return readToken(REFRESH_TOKEN_KEY);
  },
  async saveUser(user: unknown) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  },
  async clear() {
    await Promise.all([
      writeToken(ACCESS_TOKEN_KEY, null),
      writeToken(REFRESH_TOKEN_KEY, null),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },
};
