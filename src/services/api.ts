import axios from "axios";
import { env } from "@/utils/env";
import { sessionStorage } from "@/utils/storage";

let isRefreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

const notifySubscribers = (token: string | null) => {
  waitQueue.forEach((resolve) => resolve(token));
  waitQueue = [];
};

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await sessionStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = await sessionStorage.getRefreshToken();
    if (!refreshToken) {
      await sessionStorage.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push(async (token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${env.apiBaseUrl}/auth/refresh`,
        { refreshToken },
        { withCredentials: true },
      );

      await sessionStorage.saveAccessToken(data.accessToken);
      if (data.refreshToken) {
        await sessionStorage.saveRefreshToken(data.refreshToken);
      }
      if (data.user) {
        await sessionStorage.saveUser(data.user);
      }

      notifySubscribers(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      notifySubscribers(null);
      await sessionStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
