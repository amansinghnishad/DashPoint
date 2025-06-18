import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Grid3X3,
  List,
  FolderOpen,
} from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute inset-0 mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">
            Loading collection...
          </p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mb-6">
            <FolderOpen size={64} className="text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Collection not found
          </h3>
          <p className="text-gray-600 mb-6">
            This collection may have been deleted or moved.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="collection-view min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Header with Glassmorphism */}
        <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="group flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform duration-200"
                />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                {collection?.name || "Collection"}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Search */}
              <div className="relative group">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700 placeholder-gray-500 min-w-[300px]"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus
                  size={18}
                  className="group-hover:rotate-90 transition-transform duration-200"
                />
                <span className="font-semibold">Add Item</span>
              </button>
            </div>{" "}
          </div>
        </div>
        {/* Items Section */}
        {filteredItems.length === 0 ? (
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl p-12 text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
                <FolderOpen size={64} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery.trim()
                  ? "No items match your search"
                  : "Ready to add some content?"}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                {searchQuery.trim()
                  ? "Try adjusting your search terms or explore different keywords"
                  : "Start building your collection by adding your first item"}
              </p>
            </div>
            {!searchQuery.trim() && (
              <button
                onClick={handleAddItem}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform duration-200"
                />
                <span>Add Your First Item</span>
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
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ResizableItemCard
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
              </div>
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
    </div>
  );
};
