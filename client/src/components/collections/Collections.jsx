import { useState, useEffect } from "react";
import { Search, Plus, FolderOpen } from "lucide-react";
import { collectionsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { CollectionView } from "../collection/index";
import { CollectionCard } from "./components/CollectionCard";
import { CollectionForm } from "./modals/CollectionForm";

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
      const response = await collectionsAPI.getCollections(1, 50, searchQuery);
      if (response.success) {
        setCollections(response.data.collections);
      }
    } catch (err) {
      console.error("Error loading collections:", err);
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
