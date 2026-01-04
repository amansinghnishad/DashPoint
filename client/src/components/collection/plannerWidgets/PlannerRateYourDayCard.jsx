import { useEffect, useMemo, useState } from "react";

import { normalizeRateYourDayData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerRateYourDayCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeRateYourDayData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId]
  );

  const [rating, setRating] = useState(() => baseline.rating);
  const [note, setNote] = useState(() => baseline.note);

  useEffect(() => {
    setRating(baseline.rating);
    setNote(baseline.note);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ rating, note }), [note, rating]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, idx) => {
          const value = idx + 1;
          const active = value <= rating;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-9 w-9 rounded-xl border text-sm font-semibold transition-colors ${
                active
                  ? "dp-border dp-surface-muted border-2"
                  : "dp-border dp-surface dp-hover-bg"
              }`}
              aria-pressed={active}
              aria-label={`Rate ${value}`}
            >
              {value}
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Quick reflection…"
        className="dp-surface dp-border dp-text w-full min-h-[110px] resize-y rounded-xl border px-4 py-3 text-sm outline-none"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setRating(0);
            setNote("");
          }}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
