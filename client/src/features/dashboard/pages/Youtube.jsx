import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardPageLayout from "../layouts/DashboardPageLayout";
import { useToast } from "../../../hooks/useToast";
import { youtubeAPI } from "../../../services/modules/youtubeApi";
import AddToCollectionModal from "../../../shared/ui/modals/AddToCollectionModal";
import DeleteConfirmModal from "../../../shared/ui/modals/DeleteConfirmModal";
import { BookmarkPlus, IconAdd, IconDelete } from "@/shared/ui/icons";

const parseYouTubeId = (raw) => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  // If user already pasted an ID
  if (/^[a-zA-Z0-9_-]{6,}$/.test(value) && !value.includes("http"))
    return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      return id || null;
    }

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return id;

      // /shorts/<id>
      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    // ignore
  }

  return null;
};

export default function YoutubePage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const inputRef = useRef(null);
  const searchReqIdRef = useRef(0);

  const [addToCollectionItem, setAddToCollectionItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdding) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isAdding]);

  const isSearchMode = useMemo(() => Boolean((search || "").trim()), [search]);

  const items = useMemo(
    () => (isSearchMode ? searchResults : savedItems),
    [isSearchMode, savedItems, searchResults]
  );

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) || null,
    [items, selectedId]
  );

  const loadSavedVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await youtubeAPI.getAll(1, 50);
      if (!res?.success)
        throw new Error(res?.message || "Failed to load videos");

      const mapped = (res.data || []).map((v) => ({
        id: v._id,
        videoId: v.videoId,
        title: v.title,
        url: v.url,
        embedUrl: v.embedUrl,
        thumbnail: v.thumbnail,
        channelTitle: v.channelTitle,
        duration: v.duration,
        isSaved: true,
      }));
      setSavedItems(mapped);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load videos";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSavedVideos();
  }, [loadSavedVideos]);

  const saveVideoById = useCallback(
    async (videoId, urlHint, options = {}) => {
      if (!videoId) return;

      const already = savedItems.find((v) => v.videoId === videoId);
      if (already) {
        setSelectedId(already.id);
        if (options?.clearSearch) setSearch("");
        toast.info("That video is already saved.");
        return;
      }

      setIsLoading(true);
      try {
        const detailsRes = await youtubeAPI.getVideoDetails(videoId);
        if (!detailsRes?.success) {
          throw new Error(
            detailsRes?.message || "Failed to fetch video details"
          );
        }

        const details = detailsRes.data;
        const thumb =
          details?.thumbnail?.maxres ||
          details?.thumbnail?.high ||
          details?.thumbnail?.medium ||
          details?.thumbnail?.default ||
          null;
        if (!thumb) throw new Error("Missing thumbnail from YouTube details");

        const createRes = await youtubeAPI.create({
          videoId: videoId,
          title: (details.title || `YouTube: ${videoId}`).slice(0, 200),
          thumbnail: thumb,
          embedUrl:
            details.embedUrl || `https://www.youtube.com/embed/${videoId}`,
          url:
            details.url ||
            urlHint ||
            `https://www.youtube.com/watch?v=${videoId}`,
          channelTitle: details.channelTitle
            ? String(details.channelTitle).slice(0, 100)
            : undefined,
          description: details.description
            ? String(details.description).slice(0, 1000)
            : undefined,
          tags: Array.isArray(details.tags)
            ? details.tags
                .map((t) => String(t).trim())
                .filter(Boolean)
                .slice(0, 50)
            : undefined,
        });

        if (!createRes?.success) {
          throw new Error(createRes?.message || "Failed to save video");
        }

        const saved = createRes.data;
        const savedItem = {
          id: saved._id,
          videoId: saved.videoId,
          title: saved.title,
          url: saved.url,
          embedUrl: saved.embedUrl,
          thumbnail: saved.thumbnail,
          channelTitle: saved.channelTitle,
          duration: saved.duration,
          isSaved: true,
        };

        setSavedItems((prev) => [savedItem, ...prev]);
        setSelectedId(savedItem.id);
        if (options?.clearSearch) setSearch("");
        toast.success("Video saved.");
      } catch (err) {
        const status = err?.response?.status;
        const responseData = err?.response?.data;
        const message =
          responseData?.message || err?.message || "Failed to save video";

        if (status === 400 && Array.isArray(responseData?.errors)) {
          const first = responseData.errors[0];
          const detail = first?.msg || first?.message;
          if (detail) {
            toast.error(detail);
            return;
          }
        }

        // If it already exists in DB (unique index), refresh list.
        if (status === 409) {
          toast.info(message);
          await loadSavedVideos();
          if (options?.clearSearch) setSearch("");
          return;
        }

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loadSavedVideos, savedItems, toast]
  );

  const addVideo = useCallback(async () => {
    const id = parseYouTubeId(urlInput);
    if (!id) {
      toast.warning("Paste a valid YouTube URL or video id.");
      return;
    }
    await saveVideoById(id, urlInput.trim());
    setIsAdding(false);
    setUrlInput("");
  }, [saveVideoById, toast, urlInput]);

  // Real-time YouTube search (remote) when user types in the page search box.
  useEffect(() => {
    const q = (search || "").trim();
    setSearchError(null);

    if (!q) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    if (q.length < 2) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    const requestId = ++searchReqIdRef.current;
    setIsSearchLoading(true);

    const t = window.setTimeout(async () => {
      try {
        const res = await youtubeAPI.searchVideos(q, 15, "relevance");
        if (searchReqIdRef.current !== requestId) return;

        if (!res?.success) {
          throw new Error(res?.message || "YouTube search failed");
        }

        const videos = res?.data?.videos || [];
        const mapped = videos.map((v) => {
          const thumb =
            v?.thumbnail?.high ||
            v?.thumbnail?.medium ||
            v?.thumbnail?.default ||
            null;
          return {
            id: `yt:${v.id}`,
            videoId: v.id,
            title: v.title,
            url: v.url,
            embedUrl: v.embedUrl,
            thumbnail: thumb,
            channelTitle: v.channelTitle,
            publishedAt: v.publishedAt,
            isSaved: false,
          };
        });

        setSearchResults(mapped);
      } catch (err) {
        if (searchReqIdRef.current !== requestId) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "YouTube search failed";
        setSearchError(message);
        setSearchResults([]);
      } finally {
        if (searchReqIdRef.current === requestId) setIsSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(t);
  }, [search]);

  // Keep selection valid when switching between saved list and search results.
  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = items.some((it) => it.id === selectedId);
    if (!stillExists) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const confirmDelete = useCallback(async () => {
    const id = deleteItem?.id;
    if (!id) return;

    try {
      setIsDeleting(true);
      const res = await youtubeAPI.delete(id);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete video");
      }

      setSavedItems((prev) => {
        const remaining = prev.filter((x) => x.id !== id);
        setSelectedId((prevSelected) =>
          prevSelected === id ? remaining?.[0]?.id || null : prevSelected
        );
        return remaining;
      });

      toast.success("Video deleted.");
      setDeleteItem(null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete video";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem?.id, toast]);

  const viewer = selected ? (
    <div className="h-[520px] w-full">
      <iframe
        title={selected.title}
        className="h-full w-full"
        src={
          selected.embedUrl ||
          `https://www.youtube.com/embed/${selected.videoId || selected.id}`
        }
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  ) : (
    <div className="p-6">
      <p className="dp-text font-semibold">No video selected</p>
      <p className="dp-text-muted mt-1 text-sm">
        Add a YouTube URL and select it from the playlist.
      </p>
    </div>
  );

  return (
    <>
      <DashboardPageLayout
        title="YouTube"
        searchValue={search}
        onSearchChange={setSearch}
        addLabel={isAdding ? (isLoading ? "Saving..." : "Save") : "Search"}
        onAdd={() => {
          if (!isAdding) {
            setIsAdding(true);
            return;
          }
          if (!isLoading) addVideo();
        }}
        addDisabled={isLoading}
        items={items}
        selectedId={selectedId}
        onSelect={(it) => setSelectedId(it.id)}
        renderItemLeading={(it) => {
          const src = it?.thumbnail || null;
          if (!src) return null;
          return (
            <img
              src={src}
              alt=""
              className="h-10 w-16 rounded-md object-cover dp-border border"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          );
        }}
        renderItemTitle={(it) => it.title}
        renderItemSubtitle={(it) => it.url}
        renderItemActions={(it) => {
          const disabled = isLoading;

          // In search mode, show a Save button instead of saved-item actions.
          if (!it?.isSaved) {
            return (
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!it?.videoId) return;
                  saveVideoById(it.videoId, it.url, { clearSearch: true });
                }}
                aria-label="Save video"
                title="Save video"
              >
                <BookmarkPlus size={16} />
              </button>
            );
          }

          return (
            <>
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAddToCollectionItem(it);
                }}
                aria-label="Add to collection"
                title="Add to collection"
              >
                <IconAdd size={16} />
              </button>
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!it?.id) return;
                  setDeleteItem(it);
                }}
                aria-label="Delete"
                title="Delete"
              >
                <IconDelete size={16} />
              </button>
            </>
          );
        }}
        renderEmptySidebar={
          isSearchMode ? (
            <div className="p-4 text-center">
              <p className="dp-text font-semibold">
                {isSearchLoading
                  ? "Searching YouTube..."
                  : searchError
                  ? "Search failed"
                  : (search || "").trim().length < 2
                  ? "Type at least 2 characters"
                  : "No results"}
              </p>
              <p className="dp-text-muted mt-1 text-sm">
                {searchError
                  ? String(searchError)
                  : "Search pulls live results from YouTube."}
              </p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="dp-text font-semibold">No videos yet</p>
              <p className="dp-text-muted mt-1 text-sm">
                Click "Add" to paste a YouTube URL.
              </p>
            </div>
          )
        }
        viewer={
          <div className="h-full">
            <div className="dp-surface dp-border border-b px-4 py-3">
              <p className="dp-text font-semibold truncate">
                {selected ? selected.title : "Viewer"}
              </p>
            </div>

            <div className="p-4">
              {isAdding ? (
                <div className="dp-surface-muted dp-border rounded-2xl border p-4">
                  <p className="dp-text font-semibold">Add a YouTube video</p>
                  <p className="dp-text-muted mt-1 text-sm">
                    Paste a YouTube URL or video id.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={inputRef}
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addVideo}
                        className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setUrlInput("");
                        }}
                        className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {viewer}
            </div>
          </div>
        }
      />

      <AddToCollectionModal
        open={Boolean(addToCollectionItem)}
        onClose={() => setAddToCollectionItem(null)}
        itemType="youtube"
        itemId={addToCollectionItem?.id || null}
        itemTitle={addToCollectionItem?.title || null}
      />

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        onClose={() => {
          if (isDeleting) return;
          setDeleteItem(null);
        }}
        onConfirm={confirmDelete}
        title={
          deleteItem?.title ? `Delete: ${deleteItem.title}` : "Delete video"
        }
        description="Delete this saved video?"
        busy={isDeleting}
      />
    </>
  );
}
