import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Star,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  Plus,
  FolderPlus,
} from "lucide-react";
import fileService from "../../services/fileService";
import { useToast } from "../../hooks/useToast";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";

export const FileManagerTab = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const { addToast } = useToast();
  // Load initial data
  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load files
      const fileParams = {
        search: searchTerm,
        category: categoryFilter,
        limit: 50,
      };

      const filesResponse = await fileService.getFiles(fileParams);
      setFiles(filesResponse.files || []);

      // Load stats
      const statsResponse = await fileService.getStorageStats();
      setStats(statsResponse);
    } catch (error) {
      console.error("Error loading data:", error);
      addToast("Failed to load files", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles?.length) return;

    try {
      setUploading(true);

      await fileService.uploadFiles(uploadedFiles);
      addToast(
        `${uploadedFiles.length} file(s) uploaded successfully`,
        "success"
      );

      // Reset file input
      event.target.value = "";

      // Reload data
      loadData();
    } catch (error) {
      console.error("Error uploading files:", error);
      addToast("Failed to upload files", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error("Error downloading file:", error);
      addToast("Failed to download file", "error");
    }
  };

  const handleDelete = async (file) => {
    if (
      !window.confirm(`Are you sure you want to delete "${file.originalName}"?`)
    ) {
      return;
    }

    try {
      await fileService.deleteFile(file._id);
      addToast("File deleted successfully", "success");
      loadData();
    } catch (error) {
      console.error("Error deleting file:", error);
      addToast("Failed to delete file", "error");
    }
  };
  const handleToggleStar = async (file) => {
    try {
      await fileService.toggleStar(file._id);
      addToast(`File ${file.isStarred ? "unstarred" : "starred"}`, "success");
      loadData();
    } catch (error) {
      console.error("Error toggling star:", error);
      addToast("Failed to update file", "error");
    }
  };
  const handleAddToCollection = (file) => {
    setSelectedFile(file);
    setShowAddToCollection(true);
  };

  const getFileIcon = (file) => {
    return fileService.getFileIcon(file.mimetype);
  };

  const formatFileSize = (size) => {
    return fileService.formatFileSize(size);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
            <p className="text-gray-600">
              Upload, organize and manage your files
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                uploading ? "opacity-50" : ""
              }`}
            >
              <Upload size={16} className="mr-2" />
              {uploading ? "Uploading..." : "Upload Files"}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Files</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="archive">Archives</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Upload className="text-blue-500" size={32} />
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Storage
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.formattedTotalSize || "0 Bytes"}
          </div>
          <div className="text-sm text-gray-500">Used Storage</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-green-500" size={32} />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalFiles || 0}
          </div>
          <div className="text-sm text-gray-500">Total Files</div>
          <div className="text-xs text-green-600 mt-1">
            ↗ {stats.recentFiles || 0} this week
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Download className="text-purple-500" size={32} />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalDownloads || 0}
          </div>
          <div className="text-sm text-gray-500">Total Downloads</div>
        </div>
      </div>
      {/* Files */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Files</h3>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files found
            </h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter
                ? "Try adjusting your search or filters"
                : "Upload some files to get started"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {files.map((file) => (
              <div
                key={file._id}
                className={`${
                  viewMode === "grid"
                    ? "p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    : "flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                } transition-colors`}
              >
                <div
                  className={`flex items-center ${
                    viewMode === "grid" ? "flex-col text-center" : "space-x-3"
                  }`}
                >
                  <div
                    className={`text-2xl ${viewMode === "grid" ? "mb-2" : ""}`}
                  >
                    {getFileIcon(file)}
                  </div>
                  <div className={viewMode === "grid" ? "w-full" : ""}>
                    <div
                      className={`font-medium text-gray-900 ${
                        viewMode === "grid" ? "truncate" : ""
                      }`}
                    >
                      {file.originalName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {file.formattedSize} • {formatDate(file.createdAt)}
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    viewMode === "grid" ? "mt-2 justify-center" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleStar(file)}
                    className={`p-2 rounded-lg hover:bg-blue-50 ${
                      file.isStarred
                        ? "text-yellow-500"
                        : "text-gray-400 hover:text-blue-600"
                    }`}
                    title={
                      file.isStarred
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      size={16}
                      fill={file.isStarred ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => handleAddToCollection(file)}
                    className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                    title="Add to collection"
                  >
                    <FolderPlus size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                    title="Download file"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>{" "}
      {/* Add to Collection Modal */}
      {showAddToCollection && selectedFile && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={() => {
            setShowAddToCollection(false);
            setSelectedFile(null);
          }}
          itemType="file"
          itemId={selectedFile._id}
          itemTitle={selectedFile.originalName}
        />
      )}
    </div>
  );
};
