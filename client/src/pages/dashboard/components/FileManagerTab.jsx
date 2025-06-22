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
} from "lucide-react";
import fileService from "../../../services/fileService";
import { useToast } from "../../../hooks/useToast";
import { AddToCollectionModal } from "../../../components/add-to-collection-modal/AddToCollectionModal";

export const FileManagerTab = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAddToCollectionModal, setShowAddToCollectionModal] =
    useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    loadFiles();
    loadStats();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await fileService.getFiles();
      if (result.success) {
        setFiles(result.data);
      } else {
        error(result.error || "Failed to load files");
      }
    } catch (err) {
      error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };
  const loadStats = async () => {
    try {
      const result = await fileService.getStorageStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("Failed to load file stats:", err);
    }
  };
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const result = await fileService.uploadFiles(files);
      if (result.success) {
        success(`${files.length} file(s) uploaded successfully`);
        loadFiles();
        loadStats();
      } else {
        error(result.error || "Failed to upload files");
      }
    } catch (err) {
      error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };
  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file._id, file.originalName);
      success("File downloaded successfully");
    } catch (err) {
      error("Failed to download file");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const result = await fileService.deleteFile(fileId);
      if (result.success) {
        success("File deleted successfully");
        loadFiles();
        loadStats();
      } else {
        error(result.error || "Failed to delete file");
      }
    } catch (err) {
      error("Failed to delete file");
    }
  };

  const handleAddToCollection = (file) => {
    setSelectedFile(file);
    setShowAddToCollectionModal(true);
  };

  const filteredFiles = files.filter((file) =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Create a reusable component for file action buttons
  const FileActionButtons = ({ file, isListView = false }) => (
    <div className={`flex gap-${isListView ? "2" : "1"}`}>
      <button
        onClick={() => handleAddToCollection(file)}
        className={`p-1 transition-colors ${
          isListView
            ? "text-blue-600 hover:text-blue-900"
            : "text-gray-400 hover:text-blue-600"
        }`}
        title="Add to Collection"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={() => handleDownload(file)}
        className={`p-1 transition-colors ${
          isListView
            ? "text-green-600 hover:text-green-900"
            : "text-gray-400 hover:text-green-600"
        }`}
        title="Download"
      >
        <Download size={16} />
      </button>
      <button
        onClick={() => handleDelete(file._id)}
        className={`p-1 transition-colors ${
          isListView
            ? "text-red-600 hover:text-red-900"
            : "text-gray-400 hover:text-red-600"
        }`}
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <p className="text-gray-600">
            Manage and organize your uploaded files
          </p>
        </div>{" "}
        <div className="flex gap-2">
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={20} className="mr-2" />
            Upload Files
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalFiles || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Upload className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>{" "}
              <p className="text-2xl font-bold text-gray-900">
                {fileService.formatFileSize(stats.totalSize || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.favorites || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.downloads || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
                >
                  {" "}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">
                      {fileService.getFileIcon(file.mimetype)}
                    </span>
                    <FileActionButtons file={file} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {file.originalName}
                  </h3>{" "}
                  <p className="text-sm text-gray-500 mb-2">
                    {fileService.formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      {" "}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">
                            {fileService.getFileIcon(file.mimetype)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fileService.formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.mimetype}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>{" "}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <FileActionButtons file={file} isListView={true} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredFiles.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No files found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by uploading some files"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Add to Collection Modal */}
      {showAddToCollectionModal && selectedFile && (
        <AddToCollectionModal
          isOpen={showAddToCollectionModal}
          onClose={() => {
            setShowAddToCollectionModal(false);
            setSelectedFile(null);
          }}
          itemType="file"
          itemId={selectedFile._id}
          itemTitle={selectedFile.originalName}
        />
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-gray-700">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  );
};
