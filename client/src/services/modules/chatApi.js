import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const chatApi = {
  sendMessage(payload) {
    return getResponseData(apiClient.post("/chat", payload));
  },

  extractActionItems(payload) {
    return getResponseData(apiClient.post("/chat/action-items/extract", payload));
  },

  approveActionItems(payload) {
    return getResponseData(apiClient.post("/chat/action-items/approve", payload));
  },
};
