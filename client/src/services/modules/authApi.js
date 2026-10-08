import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const authAPI = {
  login(credentials) {
    return getResponseData(apiClient.post("/auth/login", credentials));
  },

  register(userData) {
    return getResponseData(apiClient.post("/auth/register", userData));
  },

  logout() {
    return getResponseData(apiClient.post("/auth/logout"));
  },

  verifyToken() {
    return getResponseData(apiClient.get("/auth/verify"));
  },

  refreshToken() {
    return getResponseData(apiClient.post("/auth/refresh"));
  },

  googleAuth(credential) {
    return getResponseData(apiClient.post("/auth/google", { credential }));
  },

  updateProfile(profile) {
    return getResponseData(apiClient.put("/auth/profile", profile));
  },

  changePassword(passwords) {
    return getResponseData(apiClient.put("/auth/password", passwords));
  },
};
