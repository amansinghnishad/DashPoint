import { useCallback } from "react";

import fileService from "../../../../../services/modules/fileService";
import { collectionsAPI } from "../../../../../services/modules/collectionsApi";
import { plannerWidgetsAPI } from "../../../../../services/modules/plannerWidgetsApi";
import { youtubeAPI } from "../../../../../services/modules/youtubeApi";
import { extractYouTubeId } from "../../../../../shared/lib/urlUtils";
import { getPickerCollectionItemType } from "./collectionPickerUtils";
import { getDefaultPlannerWidgetData } from "../utils/plannerWidgetDefaults";

export function useCollectionPickerActions({
  tool,
  collectionId,
  existingKeys,
  onClose,
  onAdded,
  toast,
  selectedId,
  setBusy,
  fileInputRef,
  photoInputRef,
  createYouTubeUrl,
  createPlannerWidgetType,
  createPlannerWidgetTitle,
}) {
  const getDefaultPlannerWidgetDataMemo = useCallback((widgetType) => {
    return getDefaultPlannerWidgetData(widgetType);
  }, []);

  const addCollectionItem = useCallback(
    async (itemType, itemId) => {
      const res = await collectionsAPI.addItemToCollection(
        collectionId,
        itemType,
        itemId
      );
      if (!res?.success) {
        throw new Error(res?.message || "Failed to add item to collection");
      }
    },
    [collectionId]
  );

  const submitExisting = useCallback(async () => {
    const itemType = getPickerCollectionItemType(tool);
    const itemId = selectedId;
    if (!itemType || !itemId) {
      toast.warning("Select an item first.");
      return;
    }

    const key = `${itemType}:${itemId}`;
    if (existingKeys?.has?.(key)) {
      toast.info("That item is already in this collection.");
      onClose?.();
      return;
    }

    try {
      setBusy(true);
      await addCollectionItem(itemType, String(itemId));
      toast.success("Added to collection.");
      onClose?.();
      await onAdded?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add item to collection";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }, [
    addCollectionItem,
    existingKeys,
    onAdded,
    onClose,
    selectedId,
    setBusy,
    toast,
    tool,
  ]);

  const uploadAndAddFiles = useCallback(
    async (fileList, acceptType) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      try {
        setBusy(true);
        const res = await fileService.uploadFiles(files);
        if (!res?.success) {
          throw new Error(res?.error || res?.message || "Upload failed");
        }

        const uploaded = Array.isArray(res.data) ? res.data : [];
        if (!uploaded.length) throw new Error("No files were uploaded");

        for (const f of uploaded) {
          if (f?._id) {
            await addCollectionItem("file", String(f._id));
          }
        }

        toast.success(
          acceptType === "photo" ? "Photo(s) added." : "File(s) added."
        );
        onClose?.();
        await onAdded?.();
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload files";
        toast.error(message);
      } finally {
        setBusy(false);
      }
    },
    [addCollectionItem, onAdded, onClose, setBusy, toast]
  );

  const createAndAdd = useCallback(async () => {
    if (tool === "file") {
      fileInputRef.current?.click();
      return;
    }

    if (tool === "photo") {
      photoInputRef.current?.click();
      return;
    }

    try {
      setBusy(true);

      if (tool === "planner") {
        const widgetType = String(createPlannerWidgetType || "").trim();
        if (!widgetType) {
          toast.warning("Choose a widget type first.");
          return;
        }

        const title = String(createPlannerWidgetTitle || "").trim();

        const createRes = await plannerWidgetsAPI.create({
          widgetType,
          title: title || undefined,
          data: getDefaultPlannerWidgetDataMemo(widgetType),
        });

        if (!createRes?.success) {
          throw new Error(createRes?.message || "Failed to create planner widget");
        }

        const created = createRes.data;
        if (!created?._id) throw new Error("Create succeeded but missing id");

        await addCollectionItem("planner", String(created._id));
        toast.success("Planner widget added.");
        onClose?.();
        await onAdded?.();
        return;
      }

      if (tool === "youtube") {
        const raw = createYouTubeUrl.trim();
        if (!raw) {
          toast.warning("Paste a YouTube link first.");
          return;
        }
        const videoId = extractYouTubeId(raw);
        if (!videoId) {
          toast.error("Invalid YouTube URL.");
          return;
        }

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
          videoId,
          title: (details.title || `YouTube: ${videoId}`).slice(0, 200),
          thumbnail: thumb,
          embedUrl: details.embedUrl || `https://www.youtube.com/embed/${videoId}`,
          url:
            details.url || raw || `https://www.youtube.com/watch?v=${videoId}`,
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
        if (!saved?._id) throw new Error("Save succeeded but missing id");

        await addCollectionItem("youtube", String(saved._id));
        toast.success("YouTube video added.");
        onClose?.();
        await onAdded?.();
        return;
      }
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const message = responseData?.message || err?.message || "Failed to create item";

      if (status === 400 && Array.isArray(responseData?.errors)) {
        const first = responseData.errors[0];
        const detail = first?.msg || first?.message;
        toast.error(detail || message);
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }, [
    addCollectionItem,
    createPlannerWidgetTitle,
    createPlannerWidgetType,
    createYouTubeUrl,
    fileInputRef,
    getDefaultPlannerWidgetDataMemo,
    onAdded,
    onClose,
    photoInputRef,
    setBusy,
    toast,
    tool,
  ]);

  return { submitExisting, uploadAndAddFiles, createAndAdd };
}
