import { useEffect, useMemo, useState } from "react";

import { normalizeTodoListData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerTodoListCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeTodoListData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId]
  );
  const [items, setItems] = useState(() => baseline.items);
  const [draftText, setDraftText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const doneCount = useMemo(
    () => items.filter((it) => it.text.trim() && it.done).length,
    [items]
  );

  useEffect(() => {
    setItems(baseline.items);
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftItem = () => {
    const text = draftText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { done: false, text }]);
    setDraftText("");
  };

  const nextData = useMemo(() => ({ items }), [items]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{doneCount} completed</div>

      <div className="dp-border rounded-2xl border p-3">
        {items.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No items yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {items.map((it, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="dp-border dp-hover-bg flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(it.done)}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], done: e.target.checked };
                          setItems(next);
                        }}
                        className="h-4 w-4"
                        aria-label={it.done ? "Mark not done" : "Mark done"}
                      />

                      {isEditing ? (
                        <input
                          value={it.text}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], text: e.target.value };
                            setItems(next);
                          }}
                          placeholder="To do…"
                          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
                        />
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="dp-text truncate text-sm font-semibold">
                            {(it.text || "").trim() || "(Untitled)"}
                          </div>
                          <div className="dp-text-muted text-xs">
                            {it.done ? "Completed" : "Pending"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label={isEditing ? "Done editing" : "Edit"}
                      title={isEditing ? "Done" : "Edit"}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="dp-text-danger inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dp-border flex items-center gap-2 rounded-2xl border p-2">
        <input
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftItem();
          }}
          placeholder="To do"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <div className="dp-border h-8 border-l" />
        <button
          type="button"
          onClick={addDraftItem}
          className="dp-text inline-flex h-10 w-10 items-center justify-center text-lg font-semibold transition-opacity hover:opacity-80"
          aria-label="Add"
          title="Add"
        >
          +
        </button>
      </div>
    </div>
  );
}
