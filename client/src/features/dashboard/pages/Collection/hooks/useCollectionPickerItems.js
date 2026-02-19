import { useCallback, useEffect, useMemo, useState } from "react";

import fileService from "../../../../../services/modules/fileService";
import { plannerWidgetsAPI } from "../../../../../services/modules/plannerWidgetsApi";
import { youtubeAPI } from "../../../../../services/modules/youtubeApi";

const DEFAULT_ITEMS_ERROR = "Failed to load items";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const toSearchText = (item) => {
  const title = item?.title || item?.name || item?.originalName || item?.filename || "";
  const subtitle = item?.channelTitle || item?.mimetype || item?.formattedSize || "";
  return `${title} ${subtitle}`.toLowerCase();
};

const getFirstSelectedId = (items) => items?.[0]?._id || null;

const normalizeList = (value) => (Array.isArray(value) ? value : []);

// Picker items
export function useCollectionPickerItems({ open, tool, toast }) {
  const [loading, setLoading] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return pickerItems;

    return pickerItems.filter((item) => toSearchText(item).includes(q));
  }, [pickerItems, search]);

  const resetPicker = useCallback(() => {
    setPickerItems([]);
    setSearch("");
    setSelectedId(null);
  }, []);

  const setLoadedItems = useCallback((items) => {
    const list = normalizeList(items);
    setPickerItems(list);
    setSelectedId(getFirstSelectedId(list));
  }, []);

  const loadYouTubeItems = useCallback(async () => {
    const response = await youtubeAPI.getAll(1, 100);
    if (!response?.success) {
      throw new Error(response?.message || "Failed to load videos");
    }
    setLoadedItems(response.data);
  }, [setLoadedItems]);

  const loadFileItems = useCallback(
    async (filterPhotos) => {
      const response = await fileService.getFiles({ page: 1, limit: 200 });
      if (!response?.success) {
        throw new Error(
          response?.error || response?.message || "Failed to load files"
        );
      }

      const list = normalizeList(response.data);
      const nextItems = filterPhotos
        ? list.filter((file) => String(file?.mimetype || "").startsWith("image/"))
        : list;

      setLoadedItems(nextItems);
    },
    [setLoadedItems]
  );

  const loadPlannerItems = useCallback(async () => {
    const response = await plannerWidgetsAPI.getAll(1, 200);
    if (!response?.success) {
      throw new Error(response?.message || "Failed to load planner widgets");
    }
    setLoadedItems(response.data);
  }, [setLoadedItems]);

  const loadItems = useCallback(
    async (toolId) => {
      if (!toolId) return;

      try {
        setLoading(true);
        resetPicker();

        if (toolId === "youtube") {
          await loadYouTubeItems();
          return;
        }

        if (toolId === "file" || toolId === "photo") {
          await loadFileItems(toolId === "photo");
          return;
        }

        if (toolId === "planner") {
          await loadPlannerItems();
          return;
        }

        setLoadedItems([]);
      } catch (err) {
        const message = getErrorMessage(err, DEFAULT_ITEMS_ERROR);
        toast?.error?.(message);
        resetPicker();
      } finally {
        setLoading(false);
      }
    },
    [loadFileItems, loadPlannerItems, loadYouTubeItems, resetPicker, setLoadedItems, toast]
  );

  useEffect(() => {
    if (!open) return;
    loadItems(tool);
  }, [loadItems, open, tool]);

  return {
    loading,
    pickerItems,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    filtered,
    loadItems,
  };
}
