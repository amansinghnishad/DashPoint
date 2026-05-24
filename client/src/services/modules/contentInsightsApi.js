import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const contentInsightsAPI = {
  accept(id, payload = {}) {
    return getResponseData(apiClient.post(`/insights/${id}/accept`, payload));
  },

  reject(id) {
    return getResponseData(apiClient.post(`/insights/${id}/reject`));
  },
};
