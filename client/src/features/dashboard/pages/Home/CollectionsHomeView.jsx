import { Plus } from "lucide-react";
import { createElement } from "react";

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
    <section className="w-full max-w-[1024px] mx-auto py-4 relative">
      {/* Breadcrumbs matching the screenshot */}
      <div className="text-[12px] text-muted-soft tracking-wider flex items-center gap-1.5 font-medium mb-3 select-none">
        <span className="opacity-70">Dashboard</span>
        <span className="opacity-30">&gt;</span>
        <span className="opacity-70 font-semibold text-ink">Collections</span>
      </div>

      {/* Main serif Heading & Subtitle */}
      <div className="mb-10 min-w-0">
        <h2 className="font-waldenburg-light text-5xl text-ink leading-tight mb-4 select-none">
          Collections
        </h2>
        <p className="text-body text-[15px] leading-relaxed max-w-[640px] select-none">
          {headerSubtitle || "Organize your intelligence layer into refined clusters. Manage projects, research journals, and media libraries with precise editorial control."}
        </p>
      </div>

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
              className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCollection}
              disabled={isCreating}
              className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
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
              className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={isSavingEdit}
              className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
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
              className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
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

      <div className="mt-6">
        {loading ? (
          createElement(LoadingGridComponent)
        ) : error ? (
          <div className="border border-hairline bg-surface-card rounded-2xl p-5">
            <p className="text-ink font-medium">Couldn't load collections</p>
            <p className="text-body mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) =>
              createElement(CollectionCardComponent, {
                key: getCollectionId(c) || c.name,
                collection: c,
                onOpen: openCollection,
                onEdit: openEdit,
                onDelete: openDelete,
              }),
            )}

            {/* Dashed New Collection Card matching the screenshot */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsCreateOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setIsCreateOpen(true);
              }}
              className="border-2 border-dashed border-hairline bg-canvas/30 hover:bg-canvas-soft rounded-2xl flex flex-col items-center justify-center h-[230px] transition-colors cursor-pointer"
              title="Create collection"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-hairline flex items-center justify-center text-muted mb-3 shadow-sm">
                <Plus size={20} />
              </div>
              <span className="text-sm font-semibold text-muted">New Collection</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
