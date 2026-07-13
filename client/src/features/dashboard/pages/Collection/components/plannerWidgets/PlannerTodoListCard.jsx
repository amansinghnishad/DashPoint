import { useEffect, useMemo, useState } from "react";
import { Trash2, Edit2 } from "lucide-react";

import { normalizeTodoListData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

const withClientKeys = (items = []) =>
  items.map((item) => ({
    ...item,
    clientKey: item?.clientKey || crypto.randomUUID(),
  }));

export default function PlannerTodoListCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeTodoListData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId],
  );
  const [items, setItems] = useState(() => withClientKeys(baseline.items));
  const [draftText, setDraftText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const doneCount = items.filter((it) => it.text.trim() && it.done).length;

  useEffect(() => {
    setItems(withClientKeys(baseline.items));
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftItem = () => {
    const text = draftText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { clientKey: crypto.randomUUID(), done: false, text }]);
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
      <div className="text-muted text-xs font-semibold">{doneCount} completed</div>

      <div className="border border-hairline rounded-2xl p-3 bg-canvas-soft/30">
        {items.length === 0 ? (
          <div className="text-muted text-sm py-2">No items yet. Add one below.</div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1 scrollbar-thin">
            {items.map((it, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={it.clientKey}
                  className="border border-hairline hover:bg-canvas-soft/50 flex items-start justify-between gap-2 rounded-xl bg-surface-card px-3 py-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(it.done)}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], done: e.target.checked };
                          setItems(next);
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-hairline text-primary focus:ring-primary/20"
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
                          placeholder="To do..."
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                      ) : (
                        <div className="min-w-0 flex-1 ml-1.5">
                          <div className={`text-ink truncate text-sm font-semibold ${it.done ? "line-through opacity-50" : ""}`}>
                            {(it.text || "").trim() || "(Untitled)"}
                          </div>
                          <div className="text-muted-soft text-[10px] font-bold uppercase tracking-wider mt-0.5">
                            {it.done ? "Completed" : "Pending"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIndex((prev) => (prev === idx ? null : idx))}
                      className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label={isEditing ? "Done editing" : "Edit"}
                      title={isEditing ? "Done" : "Edit"}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border border-hairline flex items-center gap-2 rounded-2xl p-2 bg-surface-card">
        <input
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftItem();
          }}
          placeholder="To do"
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
        />
        <div className="border-l border-hairline h-8" />
        <button
          type="button"
          onClick={addDraftItem}
          className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-9 w-9 items-center justify-center text-lg font-bold transition-all rounded-xl shrink-0"
          aria-label="Add"
          title="Add"
        >
          +
        </button>
      </div>
    </div>
  );
}
