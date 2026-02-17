import { useCallback, useEffect, useMemo, useState } from "react";

import fileService from "../../../../../services/modules/fileService";
import { plannerWidgetsAPI } from "../../../../../services/modules/plannerWidgetsApi";
import { youtubeAPI } from "../../../../../services/modules/youtubeApi";

export function useCollectionPickerItems({ open, tool, toast }) {
  const [loading, setLoading] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return pickerItems;

    return pickerItems.filter((it) => {
      const t = it?.title || it?.name || it?.originalName || it?.filename || "";
      const s = it?.channelTitle || it?.mimetype || it?.formattedSize || "";
      return `${t} ${s}`.toLowerCase().includes(q);
    });
  }, [pickerItems, search]);

  const loadItems = useCallback(
    async (toolId) => {
      if (!toolId) return;
      try {
        setLoading(true);
        setPickerItems([]);
        setSearch("");
        setSelectedId(null);

        if (toolId === "youtube") {
          const res = await youtubeAPI.getAll(1, 100);
          if (!res?.success)
            throw new Error(res?.message || "Failed to load videos");
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "file" || toolId === "photo") {
          const res = await fileService.getFiles({ page: 1, limit: 200 });
          if (!res?.success) {
            throw new Error(
              res?.error || res?.message || "Failed to load files"
            );
          }

          const list = Array.isArray(res.data) ? res.data : [];
          const next =
            toolId === "photo"
              ? list.filter((f) => String(f?.mimetype || "").startsWith("image/"))
              : list;

          setPickerItems(next);
          setSelectedId(next?.[0]?._id || null);
        }

        if (toolId === "planner") {
          const res = await plannerWidgetsAPI.getAll(1, 200);
          if (!res?.success) {
            throw new Error(res?.message || "Failed to load planner widgets");
          }
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setSelectedId(list?.[0]?._id || null);
          return;
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load items";
        toast?.error?.(message);
        setPickerItems([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    },
    [toast]
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
