import { useMemo, useState } from "react";

export default function PlannerTopPrioritiesWidget() {
  const [items, setItems] = useState(() => [
    { done: false, text: "" },
    { done: false, text: "" },
    { done: false, text: "" },
  ]);

  const remaining = useMemo(
    () => items.filter((it) => it.text.trim() && !it.done).length,
    [items]
  );

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{remaining} remaining</div>

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
              placeholder={`Priority ${idx + 1}`}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
