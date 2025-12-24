import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { collectionsAPI } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import Modal from "../../../components/Modals/Modal";

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
          <FolderOpen size={16} />
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
            <Pencil size={16} />
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
            <Trash2 size={16} />
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
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorToastShown = useRef(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    [onOpenCollection, toast]
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
    if (loading) return "Loading your collections…";
    if (error) return "Unable to load collections.";
    if (!collections.length) return "No collections yet.";
    return `${total || collections.length} collection${
      (total || collections.length) === 1 ? "" : "s"
    }`;
  }, [collections.length, error, loading, total]);

  return (
    <section className="rounded-3xl border dp-border dp-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="dp-text text-xl font-semibold">Collections</h1>
          <p className="dp-text-muted mt-1 text-sm">{headerSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="dp-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
          aria-label="Create collection"
        >
          <Plus size={16} />
          Create
        </button>
      </div>

      <Modal
        open={isCreateOpen}
        title="Create collection"
        description="Organize related items under one place."
        onClose={() => setIsCreateOpen(false)}
        disableClose={isCreating}
        closeOnOverlayClick
        size="md"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCollection}
              disabled={isCreating}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isCreating ? "Creating…" : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="dp-text-soft text-sm font-medium">Name</span>
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g., Work, Recipes, Ideas"
              className="dp-surface dp-border dp-text mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="dp-text-soft text-sm font-medium">
              Description (optional)
            </span>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="What will you store here?"
              className="dp-surface dp-border dp-text mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit collection"
        description="Update the name or description."
        onClose={() => {
          setIsEditOpen(false);
          setEditingCollection(null);
        }}
        disableClose={isSavingEdit}
        closeOnOverlayClick
        size="md"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditOpen(false);
                setEditingCollection(null);
              }}
              disabled={isSavingEdit}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={isSavingEdit}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isSavingEdit ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="dp-text-soft text-sm font-medium">Name</span>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Collection name"
              className="dp-surface dp-border dp-text mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="dp-text-soft text-sm font-medium">
              Description (optional)
            </span>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="What will you store here?"
              className="dp-surface dp-border dp-text mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={isDeleteOpen}
        title="Delete collection?"
        description={
          deletingCollection?.name
            ? `This will permanently delete “${deletingCollection.name}”.`
            : "This will permanently delete this collection."
        }
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingCollection(null);
        }}
        disableClose={isDeleting}
        closeOnOverlayClick
        size="sm"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingCollection(null);
              }}
              disabled={isDeleting}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      >
        <p className="dp-text-muted text-sm">You can’t undo this action.</p>
      </Modal>

      <div className="mt-6">
        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <div className="dp-surface dp-border rounded-2xl border p-5">
            <p className="dp-text font-medium">Couldn’t load collections</p>
            <p className="dp-text-muted mt-1 text-sm">{error}</p>
          </div>
        ) : !collections.length ? (
          <div className="dp-surface dp-border rounded-2xl border p-8 text-center">
            <p className="dp-text font-semibold">No collections yet</p>
            <p className="dp-text-muted mt-1 text-sm">
              Create a collection to start organizing your content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <CollectionCard
                key={getCollectionId(c) || c.name}
                collection={c}
                onOpen={openCollection}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
