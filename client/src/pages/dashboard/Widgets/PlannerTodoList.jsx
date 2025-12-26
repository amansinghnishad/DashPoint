import { useMemo, useState } from "react";

const newItem = () => ({ done: false, text: "" });

export default function PlannerTodoListWidget() {
  const [items, setItems] = useState(() => [newItem(), newItem(), newItem()]);

  const doneCount = useMemo(
    () => items.filter((it) => it.text.trim() && it.done).length,
    [items]
  );

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{doneCount} completed</div>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(it.done)}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], done: e.target.checked };
                setItems(next);
              }}
              className="h-4 w-4"
            />
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
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.filter((_, i) => i !== idx))
              }
              className="dp-btn-secondary rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
              aria-label="Remove"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, newItem()])}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add item
        </button>
      </div>
    </div>
  );
}
