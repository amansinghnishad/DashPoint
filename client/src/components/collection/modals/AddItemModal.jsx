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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Item to Collection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                  placeholder={`Enter ${
                    itemType === "sticky-note" ? "note" : "todo"
                  } title`}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
