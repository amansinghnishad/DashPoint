import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const calendarAPI = {
  getGoogleStatus() {
    return getResponseData(apiClient.get("/calendar/google/status"));
  },

  getGoogleAuthUrl(redirect = "/dashboard") {
    return getResponseData(
      apiClient.get("/calendar/google/auth-url", {
        params: { redirect },
      })
    );
  },

  disconnectGoogleCalendar() {
    return getResponseData(apiClient.post("/calendar/google/disconnect"));
  },

  listGoogleEvents({ timeMin, timeMax } = {}) {
    return getResponseData(
      apiClient.get("/calendar/google/events", {
        params: { timeMin, timeMax },
      })
    );
  },

  createGoogleEvent(payload) {
    return getResponseData(apiClient.post("/calendar/google/events", payload));
  },
};
