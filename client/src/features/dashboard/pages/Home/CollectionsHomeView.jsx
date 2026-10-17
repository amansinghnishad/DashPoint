import { Plus } from "lucide-react";
import { createElement } from "react";

import DashboardPageHeader from "../../../../shared/ui/DashboardPageHeader";
import Modal from "../../../../shared/ui/modals/Modal";

export default function CollectionsHomeView({
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
  const sortedCollections = [...collections]
    .sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const dateB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return dateB - dateA;
    });

  return (
    <section className="relative mx-auto w-full max-w-6xl py-4">
      <DashboardPageHeader
        title="Home"
        description="Keep your collections, files, and plans organized in one place."
      />

      {/* Create Collection Modal */}
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
              className="dp-btn-secondary rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCollection}
              disabled={isCreating}
              className="dp-btn-primary rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-ink text-sm font-medium">Name</span>
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g., Work, Recipes, Ideas"
              className="border border-hairline bg-canvas-soft text-ink mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
            />
          </label>

          <label className="block">
            <span className="text-ink text-sm font-medium">Description (optional)</span>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="What will you store here?"
              className="border border-hairline bg-canvas-soft text-ink mt-2 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      {/* Edit Collection Modal */}
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
              className="dp-btn-secondary rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={isSavingEdit}
              className="dp-btn-primary rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isSavingEdit ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-ink text-sm font-medium">Name</span>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Collection name"
              className="border border-hairline bg-canvas-soft text-ink mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
            />
          </label>

          <label className="block">
            <span className="text-ink text-sm font-medium">Description (optional)</span>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="What will you store here?"
              className="border border-hairline bg-canvas-soft text-ink mt-2 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      {/* Delete Collection Modal */}
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
              className="dp-btn-secondary rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-semantic-error hover:opacity-90 text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-muted text-sm">You can't undo this action.</p>
      </Modal>

      <div className="mt-7">
        {loading ? (
          createElement(LoadingGridComponent)
        ) : error ? (
          <div className="border border-hairline bg-surface-card rounded-2xl p-5">
            <p className="text-ink font-medium">Couldn't load collections</p>
            <p className="text-body mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <section aria-labelledby="home-collections-heading">
              <div className="mb-3">
                <h2 id="home-collections-heading" className="text-base font-semibold text-ink">Collections</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedCollections.map((c) =>
                  createElement(CollectionCardComponent, {
                    key: getCollectionId(c) || c.name,
                    collection: c,
                    onOpen: openCollection,
                    onEdit: openEdit,
                    onDelete: openDelete,
                  }),
                )}

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex h-[230px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-hairline bg-canvas/30 transition-colors hover:border-primary/30 hover:bg-canvas-soft"
                  title="Create collection"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface-card text-muted shadow-sm">
                    <Plus size={20} />
                  </span>
                  <span className="text-sm font-semibold text-muted">New Collection</span>
                </button>
              </div>
          </section>
        )}
      </div>
    </section>
  );
}
