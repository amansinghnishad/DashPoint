import { useState } from "react";

const newItem = () => ({ text: "" });

export default function PlannerCallsEmailsWidget() {
  const [items, setItems] = useState(() => [newItem(), newItem()]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={it.text}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], text: e.target.value };
                setItems(next);
              }}
              placeholder="Call / email / message…"
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
