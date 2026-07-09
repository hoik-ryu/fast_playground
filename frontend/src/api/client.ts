import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  ACCESS_TOKEN_KEY,
  getRefreshToken,
  notifySessionExpired,
  saveTokens,
} from "../auth/storage";
import { getApiErrorMessage } from "../utils/apiError";
import { toastError } from "../utils/toast";
import { refreshAccessToken } from "./refreshAccessToken";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 모든 API 요청이 거치는 공용 axios 인스턴스.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue: {
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

function processRefreshQueue(error: unknown | null, accessToken: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !accessToken) {
      reject(error);
      return;
    }
    resolve(accessToken);
  });
  refreshQueue = [];
}

function handleSessionLogout() {
  const path = window.location.pathname;
  const isAuthPage = path === "/login" || path === "/register";

  notifySessionExpired();
  if (!isAuthPage) {
    window.location.replace("/login");
  }
}

function setAuthHeader(config: RetryableRequestConfig, token: string) {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
}

function queueRetry(
  originalRequest: RetryableRequestConfig,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({
      resolve: (accessToken: string) => {
        setAuthHeader(originalRequest, accessToken);
        resolve(apiClient.request(originalRequest));
      },
      reject,
    });
  });
}

async function tryRefreshAndRetry(
  originalRequest: RetryableRequestConfig,
  error: AxiosError,
) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    handleSessionLogout();
    toastError(getApiErrorMessage(error));
    return Promise.reject(error);
  }

  if (isRefreshing) {
    return queueRetry(originalRequest);
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    const tokens = await refreshAccessToken(refreshToken);
    saveTokens(tokens.access_token, tokens.refresh_token);
    processRefreshQueue(null, tokens.access_token);
    setAuthHeader(originalRequest, tokens.access_token);
    return apiClient.request(originalRequest);
  } catch (refreshError) {
    processRefreshQueue(refreshError, null);
    handleSessionLogout();
    toastError(getApiErrorMessage(refreshError));
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    setAuthHeader(config as RetryableRequestConfig, token);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      return tryRefreshAndRetry(originalRequest, error);
    }

    toastError(getApiErrorMessage(error));
    return Promise.reject(error);
  },
);
