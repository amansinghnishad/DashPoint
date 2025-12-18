import { useState, useEffect, useCallback } from "react";
import { Search, Plus, FolderOpen } from "lucide-react";
import { collectionsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useDashboard } from "../../context/DashboardContext";
import { CollectionView } from "../collection/index";
import { CollectionCard } from "./components/CollectionCard";
import { CollectionForm } from "./modals/CollectionForm";
import "./collections.css";

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const { success, error } = useToast();
  const { loadStats } = useDashboard();

  const loadCollections = useCallback(async () => {
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
  }, [error, searchQuery]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

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
        // Refresh dashboard stats if creating a new collection
        if (!editingCollection) {
          loadStats();
        }
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
        // Refresh dashboard stats
        loadStats();
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-gray-900">Home</h2>
            <p className="text-sm text-gray-500 mt-1">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
            </p>
          </div>
          <button
            onClick={handleCreateCollection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">New</span>
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Clear search"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={40} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            {searchQuery ? "No results" : "No collections yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try a different search."
              : "Create one to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateCollection}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Create collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <div key={collection._id}>
              <CollectionCard
                collection={collection}
                onEdit={handleEditCollection}
                onDelete={handleDeleteCollection}
                onOpen={handleOpenCollection}
              />
            </div>
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
