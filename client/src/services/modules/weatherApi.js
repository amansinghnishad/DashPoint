import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const weatherAPI = {
  getCurrentWeather(location) {
    return getResponseData(
      apiClient.get("/weather/current/city", {
        params: { city: location },
      })
    );
  },

  getWeatherByCoords(lat, lon) {
    return getResponseData(
      apiClient.get("/weather/current", {
        params: { lat, lon },
      })
    );
  },
};
