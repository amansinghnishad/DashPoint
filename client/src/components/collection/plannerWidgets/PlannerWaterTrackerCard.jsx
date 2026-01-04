import { useEffect, useMemo, useState } from "react";

import { normalizeWaterTrackerData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerWaterTrackerCard({ widget }) {
  const widgetId = widget?._id;
  const max = 8;

  const baseline = useMemo(
    () => normalizeWaterTrackerData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId]
  );

  const [count, setCount] = useState(() => Math.min(max, baseline.count));

  const label = useMemo(() => `${count}/${max}`, [count]);

  useEffect(() => {
    setCount(Math.min(max, baseline.count));
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ count }), [count]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="dp-text-muted text-xs">Glasses</p>
        <p className="dp-text text-sm font-semibold">{label}</p>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: max }).map((_, idx) => {
          const active = idx < count;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCount(idx + 1)}
              className={`h-9 rounded-xl border text-sm font-semibold transition-colors ${
                active
                  ? "dp-border dp-surface-muted border-2"
                  : "dp-border dp-surface dp-hover-bg"
              }`}
              aria-pressed={active}
              aria-label={`Set ${idx + 1} glasses`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setCount(0)}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
