import { useState, useEffect } from "react";
import { Folder, Plus, Check } from "lucide-react";
import { collectionsAPI } from "../services/api";
import { useToast } from "../hooks/useToast";

export const AddToCollectionModal = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
}) => {
  const [collections, setCollections] = useState([]);
  const [itemCollections, setItemCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    if (isOpen && itemType && itemId) {
      loadData();
    }
  }, [isOpen, itemType, itemId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all collections and collections containing this item
      const [collectionsResponse, itemCollectionsResponse] = await Promise.all([
        collectionsAPI.getCollections(1, 100),
        collectionsAPI.getCollectionsForItem(itemType, itemId),
      ]);

      if (collectionsResponse.success) {
        setCollections(collectionsResponse.data.collections);
      }

      if (itemCollectionsResponse.success) {
        setItemCollections(itemCollectionsResponse.data.map((c) => c._id));
      }
    } catch (err) {
      console.error("Error loading collections:", err);
      error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = async (collectionId) => {
    try {
      const isInCollection = itemCollections.includes(collectionId);
      if (isInCollection) {
        // Remove from collection
        await collectionsAPI.removeItemFromCollection(
          collectionId,
          itemType,
          itemId
        );
        setItemCollections((prev) => prev.filter((id) => id !== collectionId));
        success("Removed from collection");
      } else {
        // Add to collection
        await collectionsAPI.addItemToCollection(
          collectionId,
          itemType,
          itemId
        );
        setItemCollections((prev) => [...prev, collectionId]);
        success("Added to collection");
      }
    } catch (err) {
      console.error("Error toggling collection:", err);
      error("Failed to update collection");
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      setCreatingCollection(true);

      // Create new collection
      const createResponse = await collectionsAPI.createCollection({
        name: newCollectionName.trim(),
        color: "#3B82F6",
        isPrivate: true,
      });

      if (createResponse.success) {
        const newCollection = createResponse.data;

        // Add item to the new collection
        await collectionsAPI.addItemToCollection(
          newCollection._id,
          itemType,
          itemId
        );

        // Update local state
        setCollections((prev) => [newCollection, ...prev]);
        setItemCollections((prev) => [...prev, newCollection._id]);
        setNewCollectionName("");
        setShowCreateForm(false);

        success("Collection created and item added");
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      error("Failed to create collection");
    } finally {
      setCreatingCollection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add to Collection
          </h3>
          <p className="text-sm text-gray-600 mt-1 truncate">{itemTitle}</p>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Folder size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No collections yet</p>
                </div>
              ) : (
                collections.map((collection) => {
                  const isInCollection = itemCollections.includes(
                    collection._id
                  );

                  return (
                    <div
                      key={collection._id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isInCollection
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleToggleCollection(collection._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: collection.color }}
                        >
                          <Folder size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {collection.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {collection.items.length} items
                          </p>
                        </div>
                      </div>

                      {isInCollection && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Create new collection */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {showCreateForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateCollection();
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim() || creatingCollection}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {creatingCollection ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewCollectionName("");
                    }}
                    className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center space-x-2 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm"
              >
                <Plus size={14} />
                <span>Create New Collection</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
