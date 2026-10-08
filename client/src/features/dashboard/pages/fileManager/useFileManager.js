import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FILE_MANAGER_ERRORS,
  getRequestErrorMessage,
  getUploadValidationMessage,
  isTextPreviewable,
  mergeUploadedItems,
  toFileItem,
  toFileItems,
} from "./fileManager.helpers";
import { useToast } from "../../../../hooks/useToast";
import fileService from "../../../../services/modules/fileService";

export function useFileManager() {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [addToCollectionItem, setAddToCollectionItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [insightQueue, setInsightQueue] = useState([]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  const loadFiles = useCallback(
    async ({ page = 1, append = false } = {}) => {
      try {
        setIsBusy(true);
        const response = await fileService.getFiles({ page, limit: 50 });
        if (!response?.success) {
          throw new Error(response?.error || response?.message || FILE_MANAGER_ERRORS.load);
        }

        const mappedItems = toFileItems(response.data);
        setItems((previousItems) =>
          append
            ? [
                ...previousItems,
                ...mappedItems.filter(
                  (item) => !previousItems.some((previous) => previous.id === item.id),
                ),
              ]
            : mappedItems,
        );
        setPagination(
          response.pagination || { current: page, total: page, count: mappedItems.length },
        );
        setSelectedId((previousId) => {
          if (!previousId) return null;
          const stillExists = append || mappedItems.some((item) => item.id === previousId);
          return stillExists ? previousId : null;
        });
      } catch (error) {
        toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.load));
      } finally {
        setIsBusy(false);
      }
    },
    [toast],
  );

  const loadMoreFiles = useCallback(() => {
    if (!isBusy && pagination.current < pagination.total) {
      return loadFiles({ page: pagination.current + 1, append: true });
    }
  }, [isBusy, loadFiles, pagination]);

  const uploadSelectedFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []);
      const validationMessage = getUploadValidationMessage(files);
      if (validationMessage) {
        toast.warning(validationMessage);
        return;
      }

      try {
        setIsBusy(true);
        const response = await fileService.uploadFiles(files);
        if (!response?.success) {
          throw new Error(response?.error || response?.message || FILE_MANAGER_ERRORS.upload);
        }

        const uploadedItems = toFileItems(response.data);
        setItems((previousItems) => mergeUploadedItems(previousItems, uploadedItems));
        setPagination((previous) => {
          const count = previous.count + uploadedItems.length;
          return { ...previous, count, total: Math.ceil(count / 50) };
        });
        setSelectedId((previousId) => uploadedItems[0]?.id || previousId);
        if (Array.isArray(response.insights) && response.insights.length) {
          setInsightQueue((current) => [...current, ...response.insights]);
        }
        if (response.partialFailure) {
          toast.warning(response.message || `${uploadedItems.length} file(s) uploaded with failures.`);
        } else {
          toast.success("File(s) uploaded.");
        }
      } catch (error) {
        toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.upload));
      } finally {
        setIsBusy(false);
      }
    },
    [toast],
  );

  const addWebLink = useCallback(
    async ({ url, title, description, tags }) => {
      try {
        setIsBusy(true);
        const response = await fileService.addWebLink({ url, title, description, tags });
        if (!response?.success) {
          throw new Error(response?.error || response?.message || "Failed to add web link");
        }

        const newFileItem = toFileItem(response.data);
        setItems((previousItems) => [newFileItem, ...previousItems]);
        setPagination((previous) => {
          const count = previous.count + 1;
          return { ...previous, count, total: Math.ceil(count / 50) };
        });
        setSelectedId(newFileItem.id);
        toast.success("Web link added successfully.");
        return true;
      } catch (error) {
        toast.error(getRequestErrorMessage(error, "Failed to add web link"));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [toast],
  );

  const removeFile = useCallback(async () => {
    const fileId = deleteItem?.id;
    if (!fileId) return;

    try {
      setIsDeleting(true);
      const response = await fileService.deleteFile(fileId);
      if (!response?.success) {
        throw new Error(response?.error || response?.message || FILE_MANAGER_ERRORS.delete);
      }

      setItems((previousItems) => {
        const remaining = previousItems.filter((item) => item.id !== fileId);
        setSelectedId((previousSelectedId) =>
          previousSelectedId === fileId ? remaining[0]?.id || null : previousSelectedId,
        );
        return remaining;
      });
      setPagination((previous) => {
        const count = Math.max(0, previous.count - 1);
        return { ...previous, count, total: Math.ceil(count / 50) };
      });

      setDeleteItem(null);
      toast.success("File deleted.");
    } catch (error) {
      toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.delete));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem?.id, toast]);

  const downloadSelectedFile = useCallback(async () => {
    if (!selected?.id) return;

    if (selected.mime === "text/html" && selected.remoteUrl) {
      try {
        const url = new URL(selected.remoteUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Only HTTP and HTTPS links can be opened");
        }
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      } catch (error) {
        toast.error(error?.message || "Invalid web link");
      }
      return;
    }

    try {
      await fileService.downloadFile(selected.id, selected.title || "download");
    } catch (error) {
      toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.download));
    }
  }, [selected, toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const loadTextPreview = async () => {
      if (!selected || !isTextPreviewable(selected.mime) || !selected.remoteUrl) {
        setTextPreview(null);
        return;
      }

      try {
        const response = await fetch(selected.remoteUrl);
        if (!response.ok) throw new Error("Preview request failed");
        setTextPreview(await response.text());
      } catch {
        setTextPreview(null);
      }
    };

    loadTextPreview();
  }, [selected]);

  return {
    state: {
      search,
      items,
      pagination,
      selected,
      selectedId,
      textPreview,
      isBusy,
      addToCollectionItem,
      deleteItem,
      isDeleting,
      insightQueue,
    },
    actions: {
      setSearch,
      setSelectedId,
      setAddToCollectionItem,
      setDeleteItem,
      uploadSelectedFiles,
      removeFile,
      downloadSelectedFile,
      setInsightQueue,
      addWebLink,
      loadMoreFiles,
    },
  };
}
