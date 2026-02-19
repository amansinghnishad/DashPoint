import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "../../../../hooks/useToast";
import fileService from "../../../../services/modules/fileService";
import {
  FILE_MANAGER_ERRORS,
  getRequestErrorMessage,
  getUploadValidationMessage,
  isTextPreviewable,
  mergeUploadedItems,
  toFileItems,
} from "./fileManager.helpers";

export function useFileManager() {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [addToCollectionItem, setAddToCollectionItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  const loadFiles = useCallback(async () => {
    try {
      setIsBusy(true);
      const response = await fileService.getFiles({ page: 1, limit: 50 });
      if (!response?.success) {
        throw new Error(response?.error || response?.message || FILE_MANAGER_ERRORS.load);
      }

      const mappedItems = toFileItems(response.data);
      setItems(mappedItems);
      setSelectedId((previousId) => previousId || mappedItems[0]?.id || null);
    } catch (error) {
      toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.load));
    } finally {
      setIsBusy(false);
    }
  }, [toast]);

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
          throw new Error(
            response?.error || response?.message || FILE_MANAGER_ERRORS.upload
          );
        }

        const uploadedItems = toFileItems(response.data);
        setItems((previousItems) => mergeUploadedItems(previousItems, uploadedItems));
        setSelectedId((previousId) => uploadedItems[0]?.id || previousId);
        toast.success("File(s) uploaded.");
      } catch (error) {
        toast.error(getRequestErrorMessage(error, FILE_MANAGER_ERRORS.upload));
      } finally {
        setIsBusy(false);
      }
    },
    [toast]
  );

  const removeFile = useCallback(async () => {
    const fileId = deleteItem?.id;
    if (!fileId) return;

    try {
      setIsDeleting(true);
      const response = await fileService.deleteFile(fileId);
      if (!response?.success) {
        throw new Error(
          response?.error || response?.message || FILE_MANAGER_ERRORS.delete
        );
      }

      setItems((previousItems) => {
        const remaining = previousItems.filter((item) => item.id !== fileId);
        setSelectedId((previousSelectedId) =>
          previousSelectedId === fileId ? remaining[0]?.id || null : previousSelectedId
        );
        return remaining;
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
      selected,
      selectedId,
      textPreview,
      isBusy,
      addToCollectionItem,
      deleteItem,
      isDeleting,
    },
    actions: {
      setSearch,
      setSelectedId,
      setAddToCollectionItem,
      setDeleteItem,
      uploadSelectedFiles,
      removeFile,
      downloadSelectedFile,
    },
  };
}
