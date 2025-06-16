import { useState } from "react";
import { Upload, FileText, Folder, Star } from "lucide-react";

export const FileManagerTab = () => {
  const [files, setFiles] = useState([
    {
      name: "Project Plan.pdf",
      size: "2.4 MB",
      type: "pdf",
      uploaded: "2 hours ago",
    },
    {
      name: "Meeting Notes.docx",
      size: "456 KB",
      type: "doc",
      uploaded: "1 day ago",
    },
    {
      name: "Presentation.pptx",
      size: "8.2 MB",
      type: "ppt",
      uploaded: "3 days ago",
    },
    {
      name: "Budget.xlsx",
      size: "1.2 MB",
      type: "excel",
      uploaded: "1 week ago",
    },
  ]);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type: file.type,
      uploaded: "Just now",
    }));
    setFiles([...newFiles, ...files]);
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📊";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    return "📁";
  };

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
          <div className="flex space-x-2">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              <Upload size={16} className="inline mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Upload className="text-blue-500" size={32} />
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              85%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">127 GB</div>
          <div className="text-sm text-gray-500">Used Storage</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-green-500" size={32} />
          </div>
          <div className="text-2xl font-bold text-gray-900">248</div>
          <div className="text-sm text-gray-500">Total Files</div>
          <div className="text-xs text-green-600 mt-1">↗ 12 this week</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Folder className="text-purple-500" size={32} />
          </div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-500">Folders</div>
          <div className="text-xs text-purple-600 mt-1">Well organized</div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
          <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>All Files</option>
              <option>Documents</option>
              <option>Images</option>
              <option>Videos</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getFileIcon(file.type)}</div>
                <div>
                  <div className="font-medium text-gray-900">{file.name}</div>
                  <div className="text-sm text-gray-500">
                    {file.size} • {file.uploaded}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                  <Star size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                  ⬇️
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors">
          <FileText className="text-blue-600 mb-2" size={24} />
          <div className="font-medium text-gray-900">Create Document</div>
          <div className="text-sm text-gray-600">Start a new document</div>
        </button>

        <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-left transition-colors">
          <Folder className="text-green-600 mb-2" size={24} />
          <div className="font-medium text-gray-900">New Folder</div>
          <div className="text-sm text-gray-600">Organize your files</div>
        </button>

        <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors">
          <Upload className="text-purple-600 mb-2" size={24} />
          <div className="font-medium text-gray-900">Bulk Upload</div>
          <div className="text-sm text-gray-600">Upload multiple files</div>
        </button>

        <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-left transition-colors">
          <Star className="text-orange-600 mb-2" size={24} />
          <div className="font-medium text-gray-900">Favorites</div>
          <div className="text-sm text-gray-600">Access starred files</div>
        </button>
      </div>
    </div>
  );
};
