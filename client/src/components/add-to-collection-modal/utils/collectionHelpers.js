import { collectionsAPI } from "../../../services/api";

/**
 * Load collections and item collections data
 */
export const loadCollectionsData = async (itemType, itemId) => {
  try {
    const [collectionsResponse, itemCollectionsResponse] = await Promise.all([
      collectionsAPI.getCollections(1, 100),
      collectionsAPI.getCollectionsForItem(itemType, itemId),
    ]);

    const collections = collectionsResponse.success ? collectionsResponse.data.collections : [];
    const itemCollections = itemCollectionsResponse.success
      ? itemCollectionsResponse.data.map((c) => c._id)
      : [];

    return {
      collections,
      itemCollections,
      success: true,
    };
  } catch (error) {
    console.error("Error loading collections:", error);
    return {
      collections: [],
      itemCollections: [],
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toggle item in collection (add or remove)
 */
export const toggleItemInCollection = async (
  collectionId,
  itemType,
  itemId,
  itemTitle,
  isAdding
) => {
  try {
    if (isAdding) {
      const response = await collectionsAPI.addItemToCollection(collectionId, {
        type: itemType,
        itemId,
        title: itemTitle,
      });
      return {
        success: response.success,
        message: "Item added to collection",
      };
    } else {
      const response = await collectionsAPI.removeItemFromCollection(
        collectionId,
        itemType,
        itemId
      );
      return {
        success: response.success,
        message: "Item removed from collection",
      };
    }
  } catch (error) {
    console.error("Error toggling item in collection:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create a new collection
 */
export const createNewCollection = async (name, description = "") => {
  try {
    const response = await collectionsAPI.createCollection({
      name,
      description,
    });

    return {
      success: response.success,
      collection: response.data,
      message: "Collection created successfully",
    };
  } catch (error) {
    console.error("Error creating collection:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
