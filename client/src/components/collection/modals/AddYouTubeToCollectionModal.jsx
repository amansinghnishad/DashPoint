import { useEffect, useMemo, useState } from "react";
import { Plus, Youtube } from "lucide-react";
import { Modal, Button, Input } from "../../ui";
import { youtubeAPI, collectionsAPI } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { extractYouTubeId } from "../utils/itemHelpers";

export const AddYouTubeToCollectionModal = ({
  isOpen,
  onClose,
  collectionId,
  onItemAdded,
}) => {
  const [mode, setMode] = useState("saved"); // saved | url
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setMode("saved");
    setSearch("");
    setUrl("");
    setTitle("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "saved") return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        // Pull saved videos (created/saved from the YouTube page)
        const res = await youtubeAPI.getAll(1, 50);
        if (cancelled) return;

        if (res?.success) {
          setVideos(Array.isArray(res.data) ? res.data : []);
        } else {
          setVideos([]);
        }
      } catch (e) {
        if (!cancelled) {
          setVideos([]);
          error("Failed to load saved YouTube videos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [error, isOpen, mode]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (!search.trim()) return true;
      const s = search.trim().toLowerCase();
      return (
        String(v.title || "")
          .toLowerCase()
          .includes(s) ||
        String(v.channelTitle || "")
          .toLowerCase()
          .includes(s)
      );
    });
  }, [search, videos]);

  const handleAdd = async (videoId) => {
    if (!collectionId || !videoId) return;

    try {
      setAddingId(videoId);
      const res = await collectionsAPI.addItemToCollection(
        collectionId,
        "youtube",
        videoId
      );

      if (res?.success) {
        success("YouTube video added to collection");
        onItemAdded?.();
        onClose?.();
      } else {
        throw new Error(res?.message || "Failed to add video");
      }
    } catch (e) {
      error(e?.message || "Failed to add video");
    } finally {
      setAddingId(null);
    }
  };

  const handleAddByUrl = async () => {
    if (!collectionId) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      error("Invalid YouTube URL");
      return;
    }

    try {
      setCreating(true);

      const details = await youtubeAPI.getVideoDetails(videoId);
      if (!details?.success) {
        throw new Error(details?.message || "Failed to fetch video details");
      }

      const d = details.data;
      const thumbnail =
        d?.thumbnail?.medium || d?.thumbnail?.default || d?.thumbnail?.high;
      if (!thumbnail || !d?.embedUrl || !d?.url) {
        throw new Error("Video details are incomplete");
      }

      const payload = {
        videoId: d.id,
        title: title || d?.title || "YouTube Video",
        thumbnail,
        embedUrl: d.embedUrl,
        url: d.url,
        duration: d.duration,
        channelTitle: d.channelTitle,
        description: d.description,
        viewCount: d.viewCount,
      };

      const createRes = await youtubeAPI.create(payload);

      if (!createRes?.success) {
        throw new Error(createRes?.message || "Failed to save video");
      }

      const savedId = createRes.data?._id;
      if (!savedId) {
        throw new Error("Failed to save video");
      }

      const addRes = await collectionsAPI.addItemToCollection(
        collectionId,
        "youtube",
        savedId
      );

      if (!addRes?.success) {
        throw new Error(addRes?.message || "Failed to add video to collection");
      }

      success("YouTube video added to collection");
      onItemAdded?.();
      onClose?.();
    } catch (e) {
      error(e?.message || "Failed to add video");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add YouTube video"
      size="lg"
    >
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("saved")}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === "saved"
                  ? "border-gray-300 bg-gray-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Saved
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === "url"
                  ? "border-gray-300 bg-gray-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              URL
            </button>
          </div>
        </div>

        {mode === "url" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (optional)
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My video"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddByUrl}
              disabled={creating || !url.trim()}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              {creating ? "Adding..." : "Add to collection"}
            </Button>
            <p className="text-xs text-gray-500">
              This will save the video and add it to this collection.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved videos..."
              />
            </div>

            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No saved videos found.
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((v) => (
                  <div
                    key={v._id}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <Youtube size={18} className="text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {v.title || "YouTube Video"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {v.channelTitle || ""}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      disabled={addingId === v._id}
                      onClick={() => handleAdd(v._id)}
                      className="shrink-0"
                    >
                      <Plus size={16} className="mr-2" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
