import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { ModalHeader } from "./components/ModalHeader";
import { CollectionList } from "./components/CollectionList";
import { CreateCollectionForm } from "./components/CreateCollectionForm";
import {
  loadCollectionsData,
  toggleItemInCollection,
  createNewCollection,
} from "./utils/collectionHelpers";

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
  const [creatingCollection, setCreatingCollection] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    if (isOpen && itemType && itemId) {
      loadData();
    }
  }, [isOpen, itemType, itemId]);

  const loadData = async () => {
    setLoading(true);
    const result = await loadCollectionsData(itemType, itemId);

    if (result.success) {
      setCollections(result.collections);
      setItemCollections(result.itemCollections);
    } else {
      error("Failed to load collections");
    }

    setLoading(false);
  };

  const handleToggleCollection = async (collectionId, isAdding) => {
    const result = await toggleItemInCollection(
      collectionId,
      itemType,
      itemId,
      itemTitle,
      isAdding
    );

    if (result.success) {
      // Update local state
      setItemCollections((prev) =>
        isAdding
          ? [...prev, collectionId]
          : prev.filter((id) => id !== collectionId)
      );

      if (isAdding) {
        success("Item added to collection");
      } else {
        info("Item removed from collection");
      }
    } else {
      error(result.error || "Failed to update collection");
    }
  };

  const handleCreateCollection = async (name) => {
    setCreatingCollection(true);
    const result = await createNewCollection(name);

    if (result.success) {
      setCollections((prev) => [...prev, result.collection]);
      success("Collection created successfully");
      setCreatingCollection(false);
      return true;
    } else {
      error(result.error || "Failed to create collection");
      setCreatingCollection(false);
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <ModalHeader itemTitle={itemTitle} onClose={onClose} />

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Adding "{itemTitle}" to collections:
            </p>
            <CollectionList
              collections={collections}
              itemCollections={itemCollections}
              onToggleCollection={handleToggleCollection}
              loading={loading}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <CreateCollectionForm
              onCreateCollection={handleCreateCollection}
              isCreating={creatingCollection}
            />
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
