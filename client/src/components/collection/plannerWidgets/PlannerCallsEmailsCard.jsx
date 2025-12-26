import { useEffect, useMemo, useState } from "react";

import { normalizeCallsEmailsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerCallsEmailsCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeCallsEmailsData(widget?.data),
    [widgetId]
  );
  const [items, setItems] = useState(() => baseline.items);

  useEffect(() => {
    setItems(baseline.items);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ items }), [items]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

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
          onClick={() => setItems((prev) => [...prev, { text: "" }])}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add item
        </button>
      </div>
    </div>
  );
}
