import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const youtubeAPI = {
  getAll(page = 1, limit = 20) {
    return getResponseData(
      apiClient.get("/youtube/videos", {
        params: { page, limit },
      })
    );
  },

  create(videoData) {
    return getResponseData(apiClient.post("/youtube/videos", videoData));
  },

  update(id, videoData) {
    return getResponseData(apiClient.put(`/youtube/videos/${id}`, videoData));
  },

  delete(id) {
    return getResponseData(apiClient.delete(`/youtube/videos/${id}`));
  },

  getVideoDetails(videoId) {
    return getResponseData(apiClient.get(`/youtube/video/${videoId}`));
  },

  searchVideos(query, maxResults = 10, order = "relevance") {
    return getResponseData(
      apiClient.get("/youtube/search", {
        params: { q: query, maxResults, order },
      })
    );
  },
};
