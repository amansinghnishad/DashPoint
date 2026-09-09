import axios from "axios";

import { clearAuthSession, getAuthToken, setAuthSession } from "../auth/authSession";
import { API_BASE_URL } from "../config/appConfig";

const PUBLIC_AUTH_PATHS = new Set(["/login", "/register"]);

function isAuthFailure(error) {
  if (error.response?.status !== 401) return false;

  const message = String(error.response?.data?.message || "").toLowerCase();
  if (!message) return true;

  return (
    message.includes("token") ||
    message.includes("expired") ||
    message.includes("invalid") ||
    message.includes("unauthorized")
  );
}

function defaultUnauthorizedHandler() {
  clearAuthSession();

  if (typeof window === "undefined") return;

  if (!PUBLIC_AUTH_PATHS.has(window.location.pathname)) {
    window.location.assign("/login");
  }
}

let unauthorizedHandler = defaultUnauthorizedHandler;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === "function" ? handler : defaultUnauthorizedHandler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt to refresh for authentication endpoints
    const requestUrl = String(originalRequest?.url || "");
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = response.data?.data?.token;
        const user = response.data?.data?.user;

        if (newToken) {
          setAuthSession(newToken, user);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }

        processQueue(new Error("Refresh returned no token"), null);
        unauthorizedHandler();
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        unauthorizedHandler();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (isAuthFailure(error) && isAuthEndpoint && requestUrl.includes("/auth/refresh")) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  },
);

export { API_BASE_URL };
