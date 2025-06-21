import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal, Button, Input } from "../../ui";
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      showCloseButton={true}
    >
      <div className="p-6 border-b border-gray-200/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
          Add New Item
        </h2>
        <p className="text-gray-600 mt-1">
          Expand your collection with fresh content
        </p>
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
            <Input
              type="url"
              value={itemData.url}
              onChange={(e) =>
                setItemData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://youtube.com/watch?v=..."
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
            <Input
              type="url"
              value={itemData.url}
              onChange={(e) =>
                setItemData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com/article"
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
              <Input
                type="text"
                value={itemData.title}
                onChange={(e) =>
                  setItemData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={`Enter ${
                  itemType === "sticky-note" ? "note" : "todo"
                } title`}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
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
          </Button>
        </div>
      </form>
    </Modal>
  );
};
