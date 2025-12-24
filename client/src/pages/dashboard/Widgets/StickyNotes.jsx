import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DeleteConfirmModal from "../../../components/Modals/DeleteConfirmModal";
import { useToast } from "../../../hooks/useToast";
import { useDashboard } from "../../../context/DashboardContext";

export default function StickyNotesWidget() {
  const toast = useToast();
  const { stickyNotes, loading, saveStickyNote, deleteStickyNote } =
    useDashboard();

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = Boolean(loading?.stickyNotes);

  const sorted = useMemo(() => {
    const list = Array.isArray(stickyNotes) ? stickyNotes : [];
    return [...list].sort((a, b) => {
      const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [stickyNotes]);

  const resetDraft = useCallback(() => {
    setDraftTitle("");
    setDraftContent("");
    setEditing(null);
  }, []);

  const startEdit = useCallback((note) => {
    setEditing(note);
    setDraftTitle(note?.title || "");
    setDraftContent(note?.content || note?.text || "");
  }, []);

  const submit = useCallback(async () => {
    const title = draftTitle.trim();
    const content = draftContent.trim();
    if (!title && !content) {
      toast.warning("Write a title or a note.");
      return;
    }

    try {
      setIsSaving(true);
      await saveStickyNote({
        ...(editing?._id ? { _id: editing._id } : null),
        title: title || "Untitled",
        content,
      });
      toast.success(editing ? "Note updated." : "Note added.");
      resetDraft();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to save note";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [draftContent, draftTitle, editing, resetDraft, saveStickyNote, toast]);

  const confirmDelete = useCallback(async () => {
    const id = deleteItem?._id;
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteStickyNote(id);
      toast.success("Note deleted.");
      setDeleteItem(null);
      if (editing?._id === id) resetDraft();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete note";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem, deleteStickyNote, editing?._id, resetDraft, toast]);

  return (
    <>
      <div className="dp-surface-muted dp-border rounded-2xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="dp-text font-semibold">
              {editing ? "Edit note" : "New note"}
            </p>
            <p className="dp-text-muted mt-1 text-sm">
              Keep it short and actionable.
            </p>
          </div>
          {editing ? (
            <button
              type="button"
              className="dp-btn-secondary rounded-xl px-3 py-2 text-sm font-semibold"
              onClick={resetDraft}
              disabled={isSaving}
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Title"
            className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="dp-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
              disabled={isSaving}
            >
              {editing ? <Pencil size={16} /> : <Plus size={16} />}
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </div>
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Write your note…"
          className="dp-surface dp-border dp-text mt-2 w-full min-h-[96px] resize-y rounded-xl border px-3 py-2 text-sm outline-none"
          disabled={isSaving}
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="dp-text-muted text-sm">Loading notes…</div>
        ) : sorted.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sorted.slice(0, 6).map((n) => {
              const id = n?._id;
              if (!id) return null;
              const title = n?.title || "Untitled";
              const content = n?.content || n?.text || "";

              return (
                <article
                  key={id}
                  className="dp-surface dp-border rounded-2xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="dp-text font-semibold truncate">{title}</p>
                      <p className="dp-text-muted mt-1 text-sm line-clamp-3">
                        {content || "(No content)"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
                        onClick={() => startEdit(n)}
                        aria-label="Edit note"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
                        onClick={() => setDeleteItem(n)}
                        aria-label="Delete note"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dp-surface dp-border rounded-2xl border p-4">
            <p className="dp-text font-semibold">No notes yet</p>
            <p className="dp-text-muted mt-1 text-sm">
              Add your first sticky note above.
            </p>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        onClose={() => {
          if (isDeleting) return;
          setDeleteItem(null);
        }}
        onConfirm={confirmDelete}
        title={
          deleteItem?.title ? `Delete note: ${deleteItem.title}` : "Delete note"
        }
        description="Delete this note?"
        busy={isDeleting}
      />
    </>
  );
}
