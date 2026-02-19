import { IconAdd } from "@/shared/ui/icons";
import Modal from "../../../../shared/ui/modals/Modal";

export default function CollectionsHomeView({
  headerSubtitle,
  setIsCreateOpen,
  isCreateOpen,
  isCreating,
  createCollection,
  createName,
  setCreateName,
  createDescription,
  setCreateDescription,
  isEditOpen,
  setIsEditOpen,
  setEditingCollection,
  isSavingEdit,
  saveEdit,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  isDeleteOpen,
  deletingCollection,
  setIsDeleteOpen,
  setDeletingCollection,
  isDeleting,
  confirmDelete,
  loading,
  error,
  collections,
  openCollection,
  openEdit,
  openDelete,
  CollectionCardComponent,
  LoadingGridComponent,
  getCollectionId,
}) {
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
          <IconAdd size={16} />
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
              {isCreating ? "Creating..." : "Create"}
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
              {isSavingEdit ? "Saving..." : "Save"}
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
            ? `This will permanently delete "${deletingCollection.name}".`
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
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="dp-text-muted text-sm">You can't undo this action.</p>
      </Modal>

      <div className="mt-6">
        {loading ? (
          <LoadingGridComponent />
        ) : error ? (
          <div className="dp-surface dp-border rounded-2xl border p-5">
            <p className="dp-text font-medium">Couldn't load collections</p>
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
              <CollectionCardComponent
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
