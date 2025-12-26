import { useMemo, useState } from "react";

export default function PlannerWaterTrackerWidget() {
  const [count, setCount] = useState(0);
  const max = 8;

  const label = useMemo(() => `${count}/${max}`, [count]);

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
