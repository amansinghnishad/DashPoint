import { useEffect, useState } from "react";
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
  initialItemType = "youtube",
}) => {
  const [itemType, setItemType] = useState(initialItemType);
  const [itemData, setItemData] = useState({ url: "", title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setItemType(initialItemType);
    setItemData({ url: "", title: "", content: "" });
  }, [initialItemType, isOpen]);

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

        const d = videoDetailsResponse.data;
        const thumbnail =
          d?.thumbnail?.medium || d?.thumbnail?.default || d?.thumbnail?.high;
        if (!thumbnail || !d?.embedUrl || !d?.url) {
          throw new Error("Video details are incomplete");
        }

        // Then create/save the video (payload must match server validation)
        const response = await youtubeAPI.create({
          videoId: d.id,
          title: itemData.title || d?.title || "YouTube Video",
          thumbnail,
          embedUrl: d.embedUrl,
          url: d.url,
          duration: d.duration,
          channelTitle: d.channelTitle,
          description: d.description,
          viewCount: d.viewCount,
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
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Add item</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a type and fill in the details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "youtube",
                label: "YouTube",
              },
              {
                value: "content",
                label: "Web content",
              },
              {
                value: "sticky-note",
                label: "Note",
              },
              {
                value: "todo",
                label: "Todo",
              },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setItemType(type.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  itemType === type.value
                    ? "border-gray-300 bg-gray-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {itemType === "youtube" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              We’ll fetch the video details automatically.
            </p>
          </div>
        )}

        {itemType === "content" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
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
              We’ll extract and save the content from the page.
            </p>
          </div>
        )}

        {(itemType === "sticky-note" || itemType === "todo") && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
              "Adding…"
            ) : (
              <>
                <Plus size={18} />
                <span>Add</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
