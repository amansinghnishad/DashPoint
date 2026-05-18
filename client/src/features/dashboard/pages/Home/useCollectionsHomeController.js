import { useCallback, useEffect, useMemo } from "react";

import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import { getCollectionsPayload } from "../../../../shared/lib/collections/collectionsResponse";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../../shared/lib/dashboardEvents";

const getCollectionId = (collection) => collection?._id || collection?.id;

export default function useCollectionsHomeController({ onOpenCollection, toast, state }) {
  const {
    collections,
    setCollections,
    total,
    setTotal,
    loading,
    setLoading,
    error,
    setError,
    errorToastShown,
    createName,
    createDescription,
    setIsCreateOpen,
    setCreateName,
    setCreateDescription,
    isCreateOpen,
    isCreating,
    setIsCreating,
    isEditOpen,
    setIsEditOpen,
    editingCollection,
    setEditingCollection,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    isSavingEdit,
    setIsSavingEdit,
    isDeleteOpen,
    setIsDeleteOpen,
    deletingCollection,
    setDeletingCollection,
    isDeleting,
    setIsDeleting,
  } = state;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await collectionsAPI.getCollections(1, 50, "");
      const normalized = getCollectionsPayload(response);
      setCollections(normalized.collections);
      setTotal(normalized.total);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load collections";
      setError(message);

      if (!errorToastShown.current) {
        errorToastShown.current = true;
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [errorToastShown, setCollections, setError, setLoading, setTotal, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleCollectionsChanged = () => {
      errorToastShown.current = false;
      load();
    };

    window.addEventListener(DASHPOINT_COLLECTIONS_CHANGED_EVENT, handleCollectionsChanged);

    return () => {
      window.removeEventListener(DASHPOINT_COLLECTIONS_CHANGED_EVENT, handleCollectionsChanged);
    };
  }, [errorToastShown, load]);

  const createCollection = useCallback(async () => {
    const name = createName.trim();
    const description = createDescription.trim();

    if (!name) {
      toast.warning("Please enter a collection name.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await collectionsAPI.createCollection({
        name,
        description: description || undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create collection");
      }

      toast.success("Collection created.");
      setIsCreateOpen(false);
      setCreateName("");
      setCreateDescription("");

      errorToastShown.current = false;
      await load();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create collection";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }, [
    createDescription,
    createName,
    errorToastShown,
    load,
    setCreateDescription,
    setCreateName,
    setIsCreateOpen,
    setIsCreating,
    toast,
  ]);

  const openEdit = useCallback(
    (collection) => {
      setEditingCollection(collection);
      setEditName((collection?.name || "").toString());
      setEditDescription((collection?.description || "").toString());
      setIsEditOpen(true);
    },
    [setEditDescription, setEditName, setEditingCollection, setIsEditOpen],
  );

  const saveEdit = useCallback(async () => {
    const id = getCollectionId(editingCollection);
    const name = editName.trim();
    const description = editDescription.trim();

    if (!id) {
      toast.error("Missing collection id.");
      return;
    }
    if (!name) {
      toast.warning("Please enter a collection name.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await collectionsAPI.updateCollection(id, {
        name,
        description: description || undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update collection");
      }

      toast.success("Collection updated.");
      setIsEditOpen(false);
      setEditingCollection(null);
      setEditName("");
      setEditDescription("");
      errorToastShown.current = false;
      await load();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update collection";
      toast.error(message);
    } finally {
      setIsSavingEdit(false);
    }
  }, [
    editDescription,
    editName,
    editingCollection,
    errorToastShown,
    load,
    setEditDescription,
    setEditName,
    setEditingCollection,
    setIsEditOpen,
    setIsSavingEdit,
    toast,
  ]);

  const openDelete = useCallback(
    (collection) => {
      setDeletingCollection(collection);
      setIsDeleteOpen(true);
    },
    [setDeletingCollection, setIsDeleteOpen],
  );

  const openCollection = useCallback(
    (collection) => {
      const id = getCollectionId(collection);
      if (!id) {
        toast.error("Missing collection id.");
        return;
      }
      onOpenCollection?.(id);
    },
    [onOpenCollection, toast],
  );

  const confirmDelete = useCallback(async () => {
    const id = getCollectionId(deletingCollection);
    if (!id) {
      toast.error("Missing collection id.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await collectionsAPI.deleteCollection(id);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete collection");
      }

      toast.success("Collection deleted.");
      setIsDeleteOpen(false);
      setDeletingCollection(null);
      errorToastShown.current = false;
      await load();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete collection";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deletingCollection,
    errorToastShown,
    load,
    setDeletingCollection,
    setIsDeleteOpen,
    setIsDeleting,
    toast,
  ]);

  const headerSubtitle = useMemo(() => {
    if (loading) return "Loading your collections...";
    if (error) return "Unable to load collections.";
    if (!collections.length) return "No collections yet.";
    return `${total || collections.length} collection${
      (total || collections.length) === 1 ? "" : "s"
    }`;
  }, [collections.length, error, loading, total]);

  return {
    getCollectionId,
    headerSubtitle,
    createCollection,
    openEdit,
    saveEdit,
    openDelete,
    openCollection,
    confirmDelete,
    ui: {
      isCreateOpen,
      isCreating,
      isEditOpen,
      isSavingEdit,
      isDeleteOpen,
      isDeleting,
    },
  };
}
