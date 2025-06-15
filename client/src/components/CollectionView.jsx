import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Search,
  Youtube,
  FileText,
  StickyNote,
  CheckSquare,
  ExternalLink,
  Play,
  Copy,
  FolderPlus,
  Maximize2,
  Minimize2,
  Grid3X3,
  List,
  Pause,
  Move,
  Volume2,
  Download,
  X,
} from "lucide-react";
import {
  collectionsAPI,
  youtubeAPI,
  contentAPI,
  stickyNotesAPI,
  todoAPI,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { formatDateTime } from "../utils/dateUtils";
import { copyToClipboard } from "../utils/helpers";

const ResizableItemCard = ({ item, onEdit, onDelete, onView, initialSize }) => {
  const [size, setSize] = useState(initialSize || { width: 320, height: 240 });
  const [isResizing, setIsResizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const { success, error } = useToast();
  // Handle resize drag
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = cardRef.current.getBoundingClientRect();
    const startData = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };

    setIsResizing(true);

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startData.x;
      const deltaY = moveEvent.clientY - startData.y;

      const newWidth = Math.max(280, startData.width + deltaX);
      const newHeight = Math.max(200, startData.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const getIcon = () => {
    switch (item.itemType) {
      case "youtube":
        return <Youtube size={16} className="text-red-500" />;
      case "content":
        return <FileText size={16} className="text-blue-500" />;
      case "sticky-note":
        return <StickyNote size={16} className="text-yellow-500" />;
      case "todo":
        return <CheckSquare size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleCopy = async (text) => {
    const copied = await copyToClipboard(text);
    if (copied) {
      success("Content copied to clipboard");
    }
  };

  const handleExternalOpen = () => {
    if (item.itemData?.url || item.itemData?.embedUrl) {
      window.open(item.itemData.url || item.itemData.embedUrl, "_blank");
    }
  };

  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const renderContent = () => {
    switch (item.itemType) {
      case "youtube":
        const videoId = extractYouTubeId(
          item.itemData?.url || item.itemData?.embedUrl
        );
        return (
          <div className="relative w-full h-full">
            {videoId ? (
              isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={item.itemData?.title || "YouTube Video"}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div
                  className="relative w-full h-full cursor-pointer bg-black rounded-lg flex items-center justify-center"
                  onClick={() => setIsPlaying(true)}
                >
                  {item.itemData?.thumbnail ? (
                    <img
                      src={item.itemData.thumbnail}
                      alt={item.itemData?.title || "YouTube Video"}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                      <Youtube size={48} className="text-red-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <Play size={48} className="text-white" />
                  </div>
                  {item.itemData?.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {item.itemData.duration}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Youtube size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Invalid YouTube URL</p>
                </div>
              </div>
            )}
          </div>
        );

      case "content":
        return (
          <div className="w-full h-full p-3 overflow-hidden bg-white rounded-lg">
            <div className="mb-2">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                {item.itemData?.title || "Web Content"}
              </h4>
              {item.itemData?.url && (
                <a
                  href={item.itemData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline line-clamp-1"
                >
                  {item.itemData.url}
                </a>
              )}
            </div>
            <div
              className={`text-sm text-gray-700 ${
                isExpanded ? "overflow-y-auto h-full" : "line-clamp-6"
              }`}
            >
              {item.itemData?.content ||
                item.itemData?.text ||
                "No content available"}
            </div>
            {item.itemData?.content && item.itemData.content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                {isExpanded ? "Show less" : "Read more..."}
              </button>
            )}
          </div>
        );

      case "sticky-note":
        return (
          <div
            className="w-full h-full p-3 rounded-lg"
            style={{ backgroundColor: item.itemData?.color || "#fef3c7" }}
          >
            <div className="mb-2">
              <h4 className="font-semibold text-sm text-gray-900">
                {item.itemData?.title || "Sticky Note"}
              </h4>
            </div>
            <div
              className={`text-sm text-gray-700 ${
                isExpanded ? "overflow-y-auto h-full" : "line-clamp-6"
              }`}
            >
              {item.itemData?.content || item.itemData?.text || "Empty note"}
            </div>
            {item.itemData?.content && item.itemData.content.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                {isExpanded ? "Show less" : "Show more..."}
              </button>
            )}
          </div>
        );

      case "todo":
        return (
          <div className="w-full h-full p-3 bg-white rounded-lg">
            <div className="mb-2">
              <h4 className="font-semibold text-sm text-gray-900">
                {item.itemData?.title || "Todo Item"}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                    item.itemData?.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {item.itemData?.completed && (
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    item.itemData?.completed
                      ? "text-green-600 line-through"
                      : "text-gray-600"
                  }`}
                >
                  {item.itemData?.completed ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
            <div
              className={`text-sm text-gray-700 ${
                isExpanded ? "overflow-y-auto h-full" : "line-clamp-4"
              }`}
            >
              {item.itemData?.description ||
                item.itemData?.content ||
                "No description"}
            </div>
            {item.itemData?.priority && (
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.itemData.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : item.itemData.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.itemData.priority} priority
                </span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full p-3 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText size={32} className="mx-auto mb-2" />
              <p className="text-sm">Unknown item type</p>
            </div>
          </div>
        );
    }
  };
  return (
    <div
      ref={cardRef}
      className={`resizable-item relative bg-white rounded-lg border-2 shadow-sm transition-all ${
        isResizing
          ? "resizing border-blue-500 shadow-lg z-50"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: "280px",
        minHeight: "200px",
      }}
    >
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 rounded-t-lg p-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <span className="text-xs font-medium text-gray-600 capitalize">
              {item.itemType.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {item.itemData?.url && (
              <button
                onClick={handleExternalOpen}
                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                title="Open original"
              >
                <ExternalLink size={12} />
              </button>
            )}
            {(item.itemData?.content || item.itemData?.text) && (
              <button
                onClick={() =>
                  handleCopy(item.itemData.content || item.itemData.text)
                }
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                title="Copy content"
              >
                <Copy size={12} />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
              title={isExpanded ? "Collapse" : "Expand content"}
            >
              {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
            <button
              onClick={() => onView(item)}
              className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
              title="View details"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100"
              title="Remove from collection"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="pt-12 pb-6 px-2 h-full overflow-hidden">
        {renderContent()}
      </div>
      {/* Footer with info */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-200 rounded-b-lg p-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate flex-1 mr-2">
            {item.itemData?.title || item.itemData?.name || "Untitled"}
          </span>
          <span className="whitespace-nowrap">
            {formatDateTime(item.addedAt)}
          </span>
        </div>
      </div>{" "}
      {/* Resize handle */}
      <div
        className={`resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize transition-all z-20 ${
          isResizing
            ? "bg-blue-500"
            : "bg-gray-400 hover:bg-blue-400 opacity-60 hover:opacity-100"
        }`}
        onMouseDown={handleResizeStart}
        title="Drag to resize"
        style={{
          borderTopLeftRadius: "6px",
          clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
        }}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 flex items-end justify-end">
          <Move size={10} className="text-white" />
        </div>
      </div>
      {/* Resizing indicator */}
      {isResizing && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-20">
          {Math.round(size.width)} × {Math.round(size.height)}
        </div>
      )}
    </div>
  );
};

const AddItemModal = ({ isOpen, onClose, collectionId, onItemAdded }) => {
  const [itemType, setItemType] = useState("youtube");
  const [itemData, setItemData] = useState({
    url: "",
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Creating item with data:", {
        itemType,
        itemData,
        collectionId,
      }); // Debug log
      let createdItemId = null; // Create the item first based on type
      if (itemType === "youtube" && itemData.url) {
        const videoId = extractYouTubeId(itemData.url);
        if (!videoId) {
          throw new Error("Invalid YouTube URL");
        }

        // First get video details from YouTube API
        const videoDetailsResponse = await youtubeAPI.getVideoDetails(videoId);
        if (!videoDetailsResponse.success) {
          throw new Error("Failed to fetch video details");
        }

        // Then create/save the video
        const response = await youtubeAPI.create({
          ...videoDetailsResponse.data,
          title:
            itemData.title ||
            videoDetailsResponse.data.title ||
            "YouTube Video",
        });

        if (response.success) {
          createdItemId = response.data._id;
        }
      } else if (itemType === "content" && itemData.url) {
        // Extract and create content item
        const response = await contentAPI.extractContent(itemData.url);

        if (response.success) {
          createdItemId = response.data._id;
        }
      } else if (itemType === "sticky-note") {
        // Create sticky note
        const response = await stickyNotesAPI.create({
          title: itemData.title || "New Note",
          content: itemData.content || "Empty note",
          color: "#fef3c7",
          position: { x: 100, y: 100, z: 1 },
        });

        if (response.success) {
          createdItemId = response.data._id;
        }
      } else if (itemType === "todo") {
        // Create todo item
        const response = await todoAPI.create({
          title: itemData.title || "New Todo",
          description: itemData.content || "",
          completed: false,
          priority: "medium",
        });

        if (response.success) {
          createdItemId = response.data._id;
        }
      }

      if (!createdItemId) {
        throw new Error("Failed to create item");
      }
      console.log("Created item ID:", createdItemId); // Debug log

      // Now add the created item to the collection
      const addResponse = await collectionsAPI.addItemToCollection(
        collectionId,
        itemType,
        createdItemId
      );

      console.log("Add to collection response:", addResponse); // Debug log

      success("Item created and added to collection");
      onItemAdded(); // This should reload the collection
      onClose();
      setItemData({ url: "", title: "", content: "" });
    } catch (err) {
      console.error("Error adding item:", err);
      error(err.message || err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Type
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="youtube">YouTube Video</option>
              <option value="content">Web Content</option>
              <option value="sticky-note">Note</option>
              <option value="todo">Todo</option>
            </select>
          </div>

          {itemType === "youtube" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={itemData.url}
                onChange={(e) =>
                  setItemData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {itemType === "content" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content URL
              </label>
              <input
                type="url"
                value={itemData.url}
                onChange={(e) =>
                  setItemData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com/article"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {(itemType === "sticky-note" || itemType === "todo") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={itemData.title}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={itemData.content}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ItemDetailModal = ({ item, isOpen, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (item && isOpen) {
      setEditData({
        title: item.itemData?.title || "",
        description: item.itemData?.description || "",
        content: item.itemData?.content || item.itemData?.text || "",
        url: item.itemData?.url || "",
      });
      setIsEditing(false);
    }
  }, [item, isOpen]);

  const handleSave = async () => {
    if (!item || !editData.title.trim()) {
      error("Title is required");
      return;
    }

    setLoading(true);
    try {
      let response;
      const updateData = {
        title: editData.title,
        description: editData.description,
        content: editData.content,
        url: editData.url,
      };

      // Update based on item type
      switch (item.itemType) {
        case "youtube":
          response = await youtubeAPI.update(item.itemId, updateData);
          break;
        case "content":
          response = await contentAPI.update(item.itemId, updateData);
          break;
        case "sticky-note":
          response = await stickyNotesAPI.update(item.itemId, updateData);
          break;
        case "todo":
          response = await todoAPI.update(item.itemId, updateData);
          break;
        default:
          throw new Error("Unknown item type");
      }

      if (response.success) {
        success("Item updated successfully");
        setIsEditing(false);
        onUpdate && onUpdate();
      }
    } catch (err) {
      console.error("Error updating item:", err);
      error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      let response;

      // Delete based on item type
      switch (item.itemType) {
        case "youtube":
          response = await youtubeAPI.delete(item.itemId);
          break;
        case "content":
          response = await contentAPI.delete(item.itemId);
          break;
        case "sticky-note":
          response = await stickyNotesAPI.delete(item.itemId);
          break;
        case "todo":
          response = await todoAPI.delete(item.itemId);
          break;
        default:
          throw new Error("Unknown item type");
      }

      if (response.success) {
        success("Item deleted successfully");
        onDelete && onDelete();
        onClose();
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = () => {
    switch (item?.itemType) {
      case "youtube":
        return <Youtube size={24} className="text-red-500" />;
      case "content":
        return <FileText size={24} className="text-blue-500" />;
      case "sticky-note":
        return <StickyNote size={24} className="text-yellow-500" />;
      case "todo":
        return <CheckSquare size={24} className="text-green-500" />;
      default:
        return <FileText size={24} className="text-gray-500" />;
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getItemIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {item.itemType.replace("-", " ")} Details
              </h3>
              <p className="text-sm text-gray-500">
                Added {formatDateTime(item.addedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                title="Edit item"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              title="Delete item"
              disabled={loading}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter title..."
                />
              </div>

              {item.itemType !== "todo" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={editData.content}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content..."
                />
              </div>

              {(item.itemType === "youtube" || item.itemType === "content") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={editData.url}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter URL..."
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading || !editData.title.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {item.itemData?.title || "Untitled"}
                </h4>
                {item.itemData?.description && (
                  <p className="text-gray-600 mb-3">
                    {item.itemData.description}
                  </p>
                )}
              </div>

              {item.itemData?.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <a
                    href={item.itemData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {item.itemData.url}
                  </a>
                </div>
              )}

              {(item.itemData?.content || item.itemData?.text) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {item.itemData.content || item.itemData.text}
                    </p>
                  </div>
                </div>
              )}

              {item.itemType === "youtube" && item.itemData?.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-600">{item.itemData.duration}</p>
                </div>
              )}

              {item.itemType === "todo" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      item.itemData?.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.itemData?.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CollectionView = ({ collectionId, onBack }) => {
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);
  const loadCollection = async () => {
    try {
      setLoading(true);
      console.log("Loading collection:", collectionId); // Debug log
      const response = await collectionsAPI.getCollectionWithItems(
        collectionId
      );
      console.log("Collection response:", response); // Debug log
      if (response.success) {
        setCollection(response.data);
        setItems(response.data.items || []);
        console.log(
          "Collection items loaded:",
          response.data.items?.length || 0,
          "items"
        ); // Debug log
        console.log("Actual items data:", response.data.items); // Debug log

        // Check each item
        response.data.items?.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            type: item.itemType,
            id: item.itemId,
            hasItemData: !!item.itemData,
            itemData: item.itemData,
          });
        });
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
      await collectionsAPI.removeItemFromCollection(
        collectionId,
        item.itemType,
        item.itemId
      );
      success("Item removed from collection");
      loadCollection(); // Reload to get updated items
    } catch (err) {
      console.error("Error removing item:", err);
      error("Failed to remove item");
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemData?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemData?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Collection not found</p>
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
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: collection.color }}
            >
              <FolderPlus size={16} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-gray-600">{collection.description}</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>{" "}
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items in collection..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>{" "}
        {/* View Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            💡 Drag the resize handles to adjust item sizes
          </div>
        </div>
      </div>
      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FolderPlus size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No items match your search"
              : "No items in this collection yet"}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 items-start">
          {filteredItems.map((item) => (
            <ResizableItemCard
              key={`${item.itemType}-${item.itemId}`}
              item={item}
              initialSize={
                item.itemType === "youtube"
                  ? { width: 400, height: 300 }
                  : item.itemType === "content"
                  ? { width: 350, height: 250 }
                  : item.itemType === "sticky-note"
                  ? { width: 280, height: 200 }
                  : { width: 320, height: 240 }
              }
              onEdit={handleViewItem}
              onDelete={handleDeleteItem}
              onView={handleViewItem}
            />
          ))}
        </div>
      )}{" "}
      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        collectionId={collectionId}
        onItemAdded={loadCollection}
      />
      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={loadCollection}
        onDelete={loadCollection}
      />
      {/* Collection Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Collection Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-medium">{items.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium">
              {formatDateTime(collection.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Updated:</span>
            <span className="ml-2 font-medium">
              {formatDateTime(collection.updatedAt)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Privacy:</span>{" "}
            <span className="ml-2 font-medium">
              {collection.isPrivate ? "Private" : "Public"}
            </span>
          </div>
        </div>{" "}
      </div>
    </div>
  );
};
