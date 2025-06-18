import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { extractYouTubeId } from "../utils/itemHelpers";
import {
  youtubeAPI,
  contentAPI,
  stickyNotesAPI,
  todoAPI,
  collectionsAPI,
} from "../../../services/api";

export const AddItemModal = ({
  isOpen,
  onClose,
  collectionId,
  onItemAdded,
}) => {
  const [itemType, setItemType] = useState("youtube");
  const [itemData, setItemData] = useState({ url: "", title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      // Now add the created item to the collection
      const addResponse = await collectionsAPI.addItemToCollection(
        collectionId,
        itemType,
        createdItemId
      );

      if (addResponse.success) {
        success("Item created and added to collection");
        onItemAdded(); // This should reload the collection
        onClose();
        setItemData({ url: "", title: "", content: "" });
      } else {
        throw new Error(
          addResponse.message || "Failed to add item to collection"
        );
      }
    } catch (err) {
      console.error("Error adding item:", err);
      error(err.message || err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Add New Item
            </h2>
            <p className="text-gray-600 mt-1">
              Expand your collection with fresh content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose Item Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "youtube",
                  label: "YouTube Video",
                  icon: "🎥",
                  color: "from-red-500 to-red-600",
                },
                {
                  value: "content",
                  label: "Web Content",
                  icon: "📄",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  value: "sticky-note",
                  label: "Note",
                  icon: "📝",
                  color: "from-yellow-500 to-yellow-600",
                },
                {
                  value: "todo",
                  label: "Todo",
                  icon: "✅",
                  color: "from-green-500 to-green-600",
                },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setItemType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    itemType === type.value
                      ? `border-transparent bg-gradient-to-r ${type.color} text-white shadow-lg`
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {itemType === "youtube" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={itemData.url}
                onChange={(e) =>
                  setItemData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Paste any YouTube video URL and we'll extract the details
                automatically
              </p>
            </div>
          )}

          {itemType === "content" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content URL
              </label>
              <input
                type="url"
                value={itemData.url}
                onChange={(e) =>
                  setItemData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com/article"
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                We'll extract and save the content from any web page
              </p>
            </div>
          )}

          {(itemType === "sticky-note" || itemType === "todo") && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={itemData.title}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={`Enter ${
                    itemType === "sticky-note" ? "note" : "todo"
                  } title`}
                  className={`w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    itemType === "sticky-note"
                      ? "focus:ring-yellow-500/50 focus:border-yellow-500/50"
                      : "focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {itemType === "sticky-note" ? "Content" : "Description"}
                </label>
                <textarea
                  value={itemData.content}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder={`Enter ${
                    itemType === "sticky-note"
                      ? "note content"
                      : "todo description"
                  }`}
                  rows={4}
                  className={`w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                    itemType === "sticky-note"
                      ? "focus:ring-yellow-500/50 focus:border-yellow-500/50"
                      : "focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm hover:bg-gray-50 rounded-xl border border-gray-200/50 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add to Collection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
