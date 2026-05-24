import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const focusAPI = {
  getSummary() {
    return getResponseData(apiClient.get("/focus"));
  },
};
