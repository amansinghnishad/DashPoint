import { useCallback, useEffect, useMemo } from "react";
import {
  IconAdd,
  IconCollection,
  IconDelete,
  IconEdit,
} from "@/shared/ui/icons";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import { useToast } from "../../../../hooks/useToast";
import useCollectionsHomeState from "./useCollectionsHomeState";
import CollectionsHomeView from "./CollectionsHomeView";

const getCollectionId = (collection) => collection?._id || collection?.id;

const normalizeCollectionsResponse = (response) => {
  if (!response || response.success !== true)
    return { collections: [], total: 0 };

  const collections =
    response.data?.collections ?? response.data?.data?.collections ?? [];
  const total =
    response.data?.pagination?.total ??
    response.data?.data?.pagination?.total ??
    (Array.isArray(collections) ? collections.length : 0);

  return {
    collections: Array.isArray(collections) ? collections : [],
    total: typeof total === "number" ? total : 0,
  };
};

function CollectionCard({ collection, onOpen, onEdit, onDelete }) {
  const name = collection?.name ?? "Untitled";
  const description = collection?.description ?? "";
  const tags = Array.isArray(collection?.tags) ? collection.tags : [];
  const itemsCount = Array.isArray(collection?.items)
    ? collection.items.length
    : typeof collection?.itemCount === "number"
      ? collection.itemCount
      : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(collection)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(collection);
      }}
      className="dp-surface dp-border rounded-2xl border p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
      aria-label={`Open collection ${name}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="dp-text text-base font-semibold truncate">{name}</p>
          {description ? (
            <p className="dp-text-muted mt-1 text-sm leading-6 line-clamp-2">
              {description}
            </p>
          ) : (
            <p className="dp-text-muted mt-1 text-sm leading-6">
              No description
            </p>
          )}

          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="dp-surface-muted dp-border dp-text-muted rounded-full border px-2.5 py-1 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dp-text-muted flex shrink-0 items-center gap-2 text-sm whitespace-nowrap sm:justify-end">
          <IconCollection size={16} />
          <span>{itemsCount}</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(collection);
            }}
            className="dp-text-muted dp-hover-text dp-hover-bg inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            aria-label="Edit collection"
            title="Edit"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(collection);
            }}
            className="dp-text-muted dp-hover-text dp-hover-bg inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            aria-label="Delete collection"
            title="Delete"
          >
            <IconDelete size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="dp-surface dp-border rounded-2xl border p-5 shadow-lg"
        >
          <div className="dp-surface-muted h-4 w-2/3 rounded" />
          <div className="dp-surface-muted mt-3 h-3 w-full rounded" />
          <div className="dp-surface-muted mt-2 h-3 w-5/6 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="dp-surface-muted h-6 w-16 rounded-full" />
            <div className="dp-surface-muted h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CollectionsHome({ onOpenCollection }) {
  const toast = useToast();
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
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
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
  } = useCollectionsHomeState();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await collectionsAPI.getCollections(1, 50, "");
      const normalized = normalizeCollectionsResponse(response);
      setCollections(normalized.collections);
      setTotal(normalized.total);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load collections";
      setError(message);

      if (!errorToastShown.current) {
        errorToastShown.current = true;
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

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
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create collection";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }, [createDescription, createName, load, toast]);

  const openEdit = useCallback((collection) => {
    setEditingCollection(collection);
    setEditName((collection?.name || "").toString());
    setEditDescription((collection?.description || "").toString());
    setIsEditOpen(true);
  }, []);

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
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update collection";
      toast.error(message);
    } finally {
      setIsSavingEdit(false);
    }
  }, [editDescription, editName, editingCollection, load, toast]);

  const openDelete = useCallback((collection) => {
    setDeletingCollection(collection);
    setIsDeleteOpen(true);
  }, []);

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
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete collection";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingCollection, load, toast]);

  const headerSubtitle = useMemo(() => {
    if (loading) return "Loading your collections...";
    if (error) return "Unable to load collections.";
    if (!collections.length) return "No collections yet.";
    return `${total || collections.length} collection${
      (total || collections.length) === 1 ? "" : "s"
    }`;
  }, [collections.length, error, loading, total]);

  return (
    <CollectionsHomeView
      headerSubtitle={headerSubtitle}
      setIsCreateOpen={setIsCreateOpen}
      isCreateOpen={isCreateOpen}
      isCreating={isCreating}
      createCollection={createCollection}
      createName={createName}
      setCreateName={setCreateName}
      createDescription={createDescription}
      setCreateDescription={setCreateDescription}
      isEditOpen={isEditOpen}
      setIsEditOpen={setIsEditOpen}
      setEditingCollection={setEditingCollection}
      isSavingEdit={isSavingEdit}
      saveEdit={saveEdit}
      editName={editName}
      setEditName={setEditName}
      editDescription={editDescription}
      setEditDescription={setEditDescription}
      isDeleteOpen={isDeleteOpen}
      deletingCollection={deletingCollection}
      setIsDeleteOpen={setIsDeleteOpen}
      setDeletingCollection={setDeletingCollection}
      isDeleting={isDeleting}
      confirmDelete={confirmDelete}
      loading={loading}
      error={error}
      collections={collections}
      openCollection={openCollection}
      openEdit={openEdit}
      openDelete={openDelete}
      CollectionCardComponent={CollectionCard}
      LoadingGridComponent={LoadingGrid}
      getCollectionId={getCollectionId}
    />
  );
}
