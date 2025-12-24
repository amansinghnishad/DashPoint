import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DeleteConfirmModal from "../../../components/Modals/DeleteConfirmModal";
import { useToast } from "../../../hooks/useToast";
import { useDashboard } from "../../../context/DashboardContext";

export default function TodoWidget() {
  const toast = useToast();
  const { todos, loading, saveTodo, toggleTodo, deleteTodo } = useDashboard();

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sorted = useMemo(() => {
    const list = Array.isArray(todos) ? todos : [];
    return [...list].sort((a, b) => {
      const aDone = Boolean(a?.completed);
      const bDone = Boolean(b?.completed);
      if (aDone !== bDone) return aDone ? 1 : -1;
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [todos]);

  const submit = useCallback(async () => {
    const value = title.trim();
    if (!value) {
      toast.warning("Enter a task title.");
      return;
    }

    try {
      setIsSaving(true);
      await saveTodo({ title: value, completed: false });
      setTitle("");
      toast.success("Task added.");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to add task";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [saveTodo, title, toast]);

  const confirmDelete = useCallback(async () => {
    const id = deleteItem?._id || deleteItem?.id;
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteTodo(id);
      toast.success("Task deleted.");
      setDeleteItem(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete task";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem, deleteTodo, toast]);

  const isLoading = Boolean(loading?.todos);

  return (
    <>
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add a task…"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
          disabled={isSaving}
        />
        <button
          type="button"
          onClick={submit}
          className="dp-btn-primary inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
          disabled={isSaving}
          aria-label="Add task"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="dp-text-muted text-sm">Loading tasks…</div>
        ) : sorted.length ? (
          <div className="space-y-2">
            {sorted.slice(0, 8).map((t) => {
              const id = t?._id || t?.id;
              if (!id) return null;
              const done = Boolean(t?.completed);

              return (
                <div
                  key={id}
                  className="dp-surface dp-border flex items-center justify-between gap-3 rounded-2xl border px-3 py-2"
                >
                  <label className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleTodo(id)}
                      className="h-4 w-4"
                    />
                    <span
                      className={`dp-text truncate text-sm font-medium ${
                        done ? "opacity-70 line-through" : ""
                      }`}
                    >
                      {t?.title || "Untitled"}
                    </span>
                  </label>

                  <button
                    type="button"
                    className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
                    onClick={() => setDeleteItem(t)}
                    aria-label="Delete task"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            {sorted.length > 8 ? (
              <p className="dp-text-muted text-xs">
                Showing 8 of {sorted.length} tasks
              </p>
            ) : null}
          </div>
        ) : (
          <div className="dp-surface-muted dp-border rounded-2xl border p-4">
            <p className="dp-text font-semibold">No tasks yet</p>
            <p className="dp-text-muted mt-1 text-sm">
              Add your first task above.
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
          deleteItem?.title ? `Delete task: ${deleteItem.title}` : "Delete task"
        }
        description="Delete this task?"
        busy={isDeleting}
      />
    </>
  );
}
