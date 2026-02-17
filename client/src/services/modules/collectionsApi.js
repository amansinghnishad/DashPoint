import { apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";

export const collectionsAPI = {
  getCollections(page = 1, limit = 20, search = "") {
    return getResponseData(
      apiClient.get("/collections", {
        params: { page, limit, search },
      })
    );
  },

  getCollection(id) {
    return getResponseData(apiClient.get(`/collections/${id}`));
  },

  getCollectionWithItems(id) {
    return getResponseData(apiClient.get(`/collections/${id}/items`));
  },

  createCollection(collectionData) {
    return getResponseData(apiClient.post("/collections", collectionData));
  },

  updateCollection(id, collectionData) {
    return getResponseData(apiClient.put(`/collections/${id}`, collectionData));
  },

  deleteCollection(id) {
    return getResponseData(apiClient.delete(`/collections/${id}`));
  },

  addItemToCollection(collectionId, itemType, itemId) {
    return getResponseData(
      apiClient.post(`/collections/${collectionId}/items`, {
        itemType,
        itemId,
      })
    );
  },

  removeItemFromCollection(collectionId, itemType, itemId) {
    return getResponseData(
      apiClient.delete(`/collections/${collectionId}/items/${itemType}/${itemId}`)
    );
  },

  getCollectionsForItem(itemType, itemId) {
    return getResponseData(apiClient.get(`/collections/item/${itemType}/${itemId}`));
  },
};
