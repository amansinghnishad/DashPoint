import { useCallback } from "react";

import fileService from "../../../../../services/modules/fileService";
import { collectionsAPI } from "../../../../../services/modules/collectionsApi";
import { plannerWidgetsAPI } from "../../../../../services/modules/plannerWidgetsApi";
import { youtubeAPI } from "../../../../../services/modules/youtubeApi";
import { getPickerCollectionItemType } from "./collectionPickerUtils";
import { getDefaultPlannerWidgetData } from "../utils/plannerWidgetDefaults";
import {
  ACTION_ERRORS,
  createPlannerWidgetRecord,
  createYouTubeRecord,
  getErrorMessage,
  getValidationMessage,
} from "./useCollectionPickerActions.helpers";

// Picker actions
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
  const getDefaultPlannerData = useCallback(
    (widgetType) => getDefaultPlannerWidgetData(widgetType),
    []
  );

  const completeAdd = useCallback(
    async (message) => {
      toast.success(message);
      onClose?.();
      await onAdded?.();
    },
    [onAdded, onClose, toast]
  );

  const addCollectionItem = useCallback(
    async (itemType, itemId) => {
      const res = await collectionsAPI.addItemToCollection(
        collectionId,
        itemType,
        itemId
      );
      if (!res?.success) {
        throw new Error(res?.message || ACTION_ERRORS.addItem);
      }
    },
    [collectionId]
  );

  const addUploadedFiles = useCallback(
    async (files) => {
      const uploadResponse = await fileService.uploadFiles(files);
      if (!uploadResponse?.success) {
        throw new Error(
          uploadResponse?.error || uploadResponse?.message || "Upload failed"
        );
      }

      const uploadedFiles = Array.isArray(uploadResponse.data)
        ? uploadResponse.data
        : [];
      if (!uploadedFiles.length) throw new Error("No files were uploaded");

      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile?._id) {
          await addCollectionItem("file", String(uploadedFile._id));
        }
      }
    },
    [addCollectionItem]
  );

  const createPlannerAndAdd = useCallback(async () => {
    const widgetType = String(createPlannerWidgetType || "").trim();
    if (!widgetType) {
      toast.warning("Choose a widget type first.");
      return;
    }

    const title = String(createPlannerWidgetTitle || "").trim();

    const createdWidget = await createPlannerWidgetRecord({
      plannerWidgetsAPI,
      widgetType,
      title,
      data: getDefaultPlannerData(widgetType),
    });

    await addCollectionItem("planner", String(createdWidget._id));
    await completeAdd("Planner widget added.");
  }, [
    addCollectionItem,
    completeAdd,
    createPlannerWidgetTitle,
    createPlannerWidgetType,
    getDefaultPlannerData,
    toast,
  ]);

  const createYouTubeAndAdd = useCallback(async () => {
    const savedVideo = await createYouTubeRecord({
      youtubeAPI,
      createYouTubeUrl,
      onWarning: toast.warning,
      onError: toast.error,
    });
    if (!savedVideo) return;

    await addCollectionItem("youtube", String(savedVideo._id));
    await completeAdd("YouTube video added.");
  }, [addCollectionItem, completeAdd, createYouTubeUrl, toast]);

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
      await completeAdd("Added to collection.");
    } catch (err) {
      const message = getErrorMessage(err, ACTION_ERRORS.addItem);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }, [
    addCollectionItem,
    completeAdd,
    existingKeys,
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
        await addUploadedFiles(files);
        await completeAdd(
          acceptType === "photo" ? "Photo(s) added." : "File(s) added."
        );
      } catch (err) {
        const message = getErrorMessage(err, ACTION_ERRORS.upload);
        toast.error(message);
      } finally {
        setBusy(false);
      }
    },
    [addUploadedFiles, completeAdd, setBusy, toast]
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
        await createPlannerAndAdd();
        return;
      }

      if (tool === "youtube") {
        await createYouTubeAndAdd();
        return;
      }
    } catch (err) {
      toast.error(getValidationMessage(err, ACTION_ERRORS.createItem));
    } finally {
      setBusy(false);
    }
  }, [
    createPlannerAndAdd,
    createYouTubeAndAdd,
    fileInputRef,
    photoInputRef,
    setBusy,
    toast,
    tool,
  ]);

  return { submitExisting, uploadAndAddFiles, createAndAdd };
}
