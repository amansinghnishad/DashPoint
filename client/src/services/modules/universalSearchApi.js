import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const universalSearchAPI = {
  search(q, limit = 6) {
    return getResponseData(
      apiClient.get("/search", {
        params: { q, limit },
      }),
    );
  },
};
