import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useToast } from "@/hooks/useToast";
import { youtubeAPI } from "@/services/modules/youtubeApi";
import { parseYouTubeId } from "../utils/parseYouTubeId";
import { SEARCH_INITIAL_STATE, searchReducer } from "../state/searchReducer";
import { UI_INITIAL_STATE, uiReducer } from "../state/uiReducer";

export default function useYoutubePageController() {
  const toast = useToast();
  const [searchState, dispatchSearch] = useReducer(
    searchReducer,
    SEARCH_INITIAL_STATE,
  );
  const [savedItems, setSavedItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const inputRef = useRef(null);
  const searchReqIdRef = useRef(0);
  const [uiState, dispatchUi] = useReducer(uiReducer, UI_INITIAL_STATE);

  useEffect(() => {
    if (uiState.isAdding) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [uiState.isAdding]);

  const search = searchState.query;
  const isSearchMode = Boolean((search || "").trim());
  const items = isSearchMode ? searchState.results : savedItems;

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) || null,
    [items, selectedId],
  );

  const loadSavedVideos = useCallback(async () => {
    try {
      dispatchUi({ type: "SET_LOADING", payload: true });
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
      dispatchUi({ type: "SET_LOADING", payload: false });
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
        if (options?.clearSearch)
          dispatchSearch({ type: "SET_QUERY", payload: "" });
        toast.info("That video is already saved.");
        return;
      }

      dispatchUi({ type: "SET_LOADING", payload: true });
      try {
        const detailsRes = await youtubeAPI.getVideoDetails(videoId);
        if (!detailsRes?.success) {
          throw new Error(
            detailsRes?.message || "Failed to fetch video details",
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
          videoId,
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
        if (options?.clearSearch)
          dispatchSearch({ type: "SET_QUERY", payload: "" });
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

        if (status === 409) {
          toast.info(message);
          await loadSavedVideos();
          if (options?.clearSearch)
            dispatchSearch({ type: "SET_QUERY", payload: "" });
          return;
        }

        toast.error(message);
      } finally {
        dispatchUi({ type: "SET_LOADING", payload: false });
      }
    },
    [loadSavedVideos, savedItems, toast],
  );

  const addVideo = useCallback(async () => {
    const id = parseYouTubeId(uiState.urlInput);
    if (!id) {
      toast.warning("Paste a valid YouTube URL or video id.");
      return;
    }
    await saveVideoById(id, uiState.urlInput.trim());
    dispatchUi({ type: "RESET_ADD_FORM" });
  }, [saveVideoById, toast, uiState.urlInput]);

  useEffect(() => {
    const q = (search || "").trim();
    dispatchSearch({ type: "RESET" });

    if (!q || q.length < 2) return;

    const requestId = ++searchReqIdRef.current;
    dispatchSearch({ type: "START" });

    const t = window.setTimeout(async () => {
      try {
        const res = await youtubeAPI.searchVideos(q, 15, "relevance");
        if (searchReqIdRef.current !== requestId) return;

        if (!res?.success)
          throw new Error(res?.message || "YouTube search failed");

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

        dispatchSearch({ type: "SUCCESS", payload: mapped });
      } catch (err) {
        if (searchReqIdRef.current !== requestId) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "YouTube search failed";
        dispatchSearch({ type: "FAIL", payload: message });
      }
    }, 350);

    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = items.some((it) => it.id === selectedId);
    if (!stillExists) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const confirmDelete = useCallback(async () => {
    const id = uiState.deleteItem?.id;
    if (!id) return;

    try {
      dispatchUi({ type: "SET_DELETING", payload: true });
      const res = await youtubeAPI.delete(id);
      if (!res?.success)
        throw new Error(res?.message || "Failed to delete video");

      setSavedItems((prev) => {
        const remaining = prev.filter((x) => x.id !== id);
        setSelectedId((prevSelected) =>
          prevSelected === id ? remaining?.[0]?.id || null : prevSelected,
        );
        return remaining;
      });

      toast.success("Video deleted.");
      dispatchUi({ type: "CLOSE_DELETE" });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete video";
      toast.error(message);
    } finally {
      dispatchUi({ type: "SET_DELETING", payload: false });
    }
  }, [toast, uiState.deleteItem?.id]);

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

  return {
    search,
    dispatchSearch,
    uiState,
    addVideo,
    items,
    selectedId,
    setSelectedId,
    saveVideoById,
    dispatchUi,
    isSearchMode,
    searchState,
    selected,
    viewer,
    inputRef,
    confirmDelete,
  };
}
