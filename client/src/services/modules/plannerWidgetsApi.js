import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const plannerWidgetsAPI = {
  getAll(page = 1, limit = 50) {
    return getResponseData(
      apiClient.get("/planner-widgets", {
        params: { page, limit },
      })
    );
  },

  getById(id) {
    return getResponseData(apiClient.get(`/planner-widgets/${id}`));
  },

  create(widgetData) {
    return getResponseData(apiClient.post("/planner-widgets", widgetData));
  },

  update(id, widgetData) {
    return getResponseData(apiClient.put(`/planner-widgets/${id}`, widgetData));
  },

  delete(id) {
    return getResponseData(apiClient.delete(`/planner-widgets/${id}`));
  },
};
