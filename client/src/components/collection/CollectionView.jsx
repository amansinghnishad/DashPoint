import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Grid3X3, List } from "lucide-react";
import { collectionsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { ResizableItemCard, AddItemModal, ItemDetailsModal } from "./index";

export const CollectionView = ({ collectionId, onBack }) => {
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const { success, error } = useToast();

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const response = await collectionsAPI.getCollectionWithItems(
        collectionId
      );

      if (response.success) {
        setCollection(response.data);
        setItems(response.data.items || []);
      } else {
        console.error("Failed to load collection:", response);
        error("Failed to load collection");
      }
    } catch (err) {
      console.error("Error loading collection:", err);
      error("Failed to load collection");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteItem = async (item) => {
    if (!window.confirm("Remove this item from the collection?")) return;

    try {
      const response = await collectionsAPI.removeItemFromCollection(
        collectionId,
        item.itemType,
        item.itemId
      );

      if (response.success) {
        success("Item removed from collection");
        loadCollection(); // Reload the collection
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      error(err.message || "Failed to remove item");
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleItemAdded = () => {
    loadCollection(); // Reload the collection after adding an item
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const title = item.itemData?.title?.toLowerCase() || "";
    const content = item.itemData?.content?.toLowerCase() || "";
    const description = item.itemData?.description?.toLowerCase() || "";
    const itemType = item.itemType?.toLowerCase() || "";

    return (
      title.includes(query) ||
      content.includes(query) ||
      description.includes(query) ||
      itemType.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Collection not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="collection-view max-w-full mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Grid view"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Collection Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-gray-600 mb-2">{collection.description}</p>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{filteredItems.length} items</span>
          {collection.tags && collection.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <span>Tags:</span>
              {collection.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchQuery.trim()
              ? "No items match your search."
              : "This collection is empty."}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }`}
        >
          {filteredItems.map((item) => (
            <ResizableItemCard
              key={item._id}
              item={item}
              onEdit={handleViewItem}
              onDelete={handleDeleteItem}
              onView={handleViewItem}
              initialSize={
                viewMode === "list"
                  ? { width: "100%", height: 200 }
                  : { width: 320, height: 240 }
              }
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        collectionId={collectionId}
        onItemAdded={handleItemAdded}
      />

      <ItemDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
