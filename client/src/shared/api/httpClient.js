import axios from "axios";

import { clearAuthSession, getAuthToken } from "../auth/authSession";
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
  unauthorizedHandler =
    typeof handler === "function" ? handler : defaultUnauthorizedHandler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (!token) return config;

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthFailure(error)) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
