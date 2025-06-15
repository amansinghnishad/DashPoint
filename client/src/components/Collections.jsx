import { useState, useEffect } from "react";
import {
  Folder,
  Plus,
  Edit3,
  Trash2,
  Search,
  Tag,
  Eye,
  EyeOff,
  FolderOpen,
  Youtube,
  FileText,
  StickyNote,
  CheckSquare,
} from "lucide-react";
import { collectionsAPI } from "../services/api";
import { useToast } from "../hooks/useToast";
import { CollectionView } from "./CollectionView";

const CollectionCard = ({ collection, onEdit, onDelete, onOpen }) => {
  const getItemTypeIcon = (itemType) => {
    switch (itemType) {
      case "youtube":
        return <Youtube size={14} className="text-red-500" />;
      case "content":
        return <FileText size={14} className="text-blue-500" />;
      case "sticky-note":
        return <StickyNote size={14} className="text-yellow-500" />;
      case "todo":
        return <CheckSquare size={14} className="text-green-500" />;
      default:
        return <Folder size={14} className="text-gray-500" />;
    }
  };

  const getItemTypeCounts = () => {
    const counts = {};
    collection.items.forEach((item) => {
      counts[item.itemType] = (counts[item.itemType] || 0) + 1;
    });
    return counts;
  };

  const itemCounts = getItemTypeCounts();

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 p-4 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: collection.color }}
          >
            <Folder size={16} />
          </div>
          <div>
            <h3
              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => onOpen(collection)}
            >
              {collection.name}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{collection.items.length} items</span>
              {!collection.isPrivate && <Eye size={12} />}
              {collection.isPrivate && <EyeOff size={12} />}
            </div>
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(collection)}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Edit collection"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(collection)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* Item type counts */}
      {collection.items.length > 0 && (
        <div className="flex items-center space-x-3 mb-3">
          {Object.entries(itemCounts).map(([type, count]) => (
            <div key={type} className="flex items-center space-x-1">
              {getItemTypeIcon(type)}
              <span className="text-xs text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {collection.tags && collection.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {collection.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
          {collection.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{collection.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const CollectionForm = ({ collection, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    color: collection?.color || "#3B82F6",
    icon: collection?.icon || "Folder",
    tags: collection?.tags?.join(", ") || "",
    isPrivate:
      collection?.isPrivate !== undefined ? collection.isPrivate : true,
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    await onSave(data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {collection ? "Edit Collection" : "Create New Collection"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection name"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-gray-400"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                Private collection
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : collection ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const { success, error, info } = useToast();

  useEffect(() => {
    loadCollections();
  }, [searchQuery]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      console.log("Loading collections with search:", searchQuery); // Debug log
      const response = await collectionsAPI.getCollections(1, 50, searchQuery);
      console.log("Collections response:", response); // Debug log
      if (response.success) {
        setCollections(response.data.collections);
        console.log("Loaded collections:", response.data.collections); // Debug log
      }
    } catch (error) {
      console.error("Error loading collections:", error);
      error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setShowForm(true);
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setShowForm(true);
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      let response;
      if (editingCollection) {
        response = await collectionsAPI.updateCollection(
          editingCollection._id,
          collectionData
        );
      } else {
        response = await collectionsAPI.createCollection(collectionData);
      }
      if (response.success) {
        success(
          editingCollection
            ? "Collection updated successfully"
            : "Collection created successfully"
        );
        setShowForm(false);
        setEditingCollection(null);
        loadCollections();
      }
    } catch (err) {
      console.error("Error saving collection:", err);
      error(
        err.response?.data?.message ||
          `Failed to ${editingCollection ? "update" : "create"} collection`
      );
    }
  };

  const handleDeleteCollection = async (collection) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const response = await collectionsAPI.deleteCollection(collection._id);
      if (response.success) {
        success("Collection deleted successfully");
        loadCollections();
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      error("Failed to delete collection");
    }
  };
  const handleOpenCollection = (collection) => {
    setSelectedCollectionId(collection._id);
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
    loadCollections(); // Refresh collections in case items were modified
  };

  // If a collection is selected, show the CollectionView
  if (selectedCollectionId) {
    return (
      <CollectionView
        collectionId={selectedCollectionId}
        onBack={handleBackToCollections}
      />
    );
  }

  return (
    <div className="collections max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
          <p className="text-gray-600 mt-1">
            Organize your content into themed folders
          </p>
        </div>
        <button
          onClick={handleCreateCollection}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No collections found" : "No collections yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Create your first collection to organize your content"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateCollection}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>Create Collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={collection}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onOpen={handleOpenCollection}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <CollectionForm
          collection={editingCollection}
          onSave={handleSaveCollection}
          onCancel={() => {
            setShowForm(false);
            setEditingCollection(null);
          }}
        />
      )}
    </div>
  );
};
