import { useEffect, useMemo, useState } from "react";

import { normalizeMealPlannerData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerMealPlannerCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeMealPlannerData(widget?.data),
    [widgetId]
  );
  const [items, setItems] = useState(() => baseline.items);

  const filledCount = useMemo(
    () => items.filter((it) => (it.text || "").trim()).length,
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
      <div className="dp-text-muted text-xs">{filledCount} planned meals</div>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-2 md:grid-cols-[140px_140px_1fr_auto] md:items-center"
          >
            <select
              value={it.day}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], day: e.target.value };
                setItems(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="">Day</option>
              <option value="Mon">Mon</option>
              <option value="Tue">Tue</option>
              <option value="Wed">Wed</option>
              <option value="Thu">Thu</option>
              <option value="Fri">Fri</option>
              <option value="Sat">Sat</option>
              <option value="Sun">Sun</option>
            </select>
            <select
              value={it.meal}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], meal: e.target.value };
                setItems(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="">Meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <input
              value={it.text}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], text: e.target.value };
                setItems(next);
              }}
              placeholder="Meal…"
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
          onClick={() =>
            setItems((prev) => [...prev, { day: "", meal: "", text: "" }])
          }
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add meal
        </button>
      </div>
    </div>
  );
}
