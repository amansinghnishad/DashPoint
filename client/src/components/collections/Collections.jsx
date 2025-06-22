import { useState, useEffect } from "react";
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
  const { success, error, info } = useToast();
  const { loadStats } = useDashboard();

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
    <div className="collections max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section with Glassmorphism */}
      <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Collections
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Organize your content into beautifully themed collections
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                {collections.length} collections
              </span>
            </div>
          </div>
          <button
            onClick={handleCreateCollection}
            className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            <span className="font-semibold">New Collection</span>
          </button>
        </div>

        {/* Search Bar with Enhanced Styling */}
        <div className="mt-6">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections by name, description, or tags..."
              className="w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>{" "}
      {/* Collections Grid with Enhanced Design */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading collections...
          </p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6">
              <FolderOpen size={64} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? "No collections found" : "Ready to get organized?"}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? "Try adjusting your search terms or explore different keywords"
                : "Create your first collection to start organizing your content in style"}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleCreateCollection}
              className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform duration-200"
              />
              <span>Create Your First Collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection, index) => (
            <div
              key={collection._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
