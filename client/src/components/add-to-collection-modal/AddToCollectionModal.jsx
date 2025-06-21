import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { Modal, Button } from "../ui";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add "${itemTitle}" to Collections`}
      size="md"
    >
      <div className="space-y-4">
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

        <div className="border-t border-gray-200 pt-4">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
