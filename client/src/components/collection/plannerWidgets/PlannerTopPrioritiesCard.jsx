import { useEffect, useMemo, useState } from "react";

import { normalizeTopPrioritiesData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerTopPrioritiesCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeTopPrioritiesData(widget?.data),
    // Reset when swapping widgets; we intentionally key off widgetId.
    [widgetId]
  );

  const [items, setItems] = useState(() => baseline.items);

  const remaining = useMemo(
    () => items.filter((it) => it.text.trim() && !it.done).length,
    [items]
  );

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
