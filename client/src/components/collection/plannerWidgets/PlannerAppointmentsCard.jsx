import { useEffect, useMemo, useState } from "react";

import { normalizeAppointmentsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerAppointmentsCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeAppointmentsData(widget?.data),
    [widgetId]
  );
  const [items, setItems] = useState(() => baseline.items);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return items.filter((it) => {
      if (!it?.title?.trim()) return false;
      if (!it?.when) return false;
      const ts = new Date(it.when).getTime();
      if (!Number.isFinite(ts)) return false;
      return ts >= now;
    }).length;
  }, [items]);

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
      <div className="dp-text-muted text-xs">{upcomingCount} upcoming</div>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr_auto] md:items-center"
          >
            <input
              type="datetime-local"
              value={it.when}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], when: e.target.value };
                setItems(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              value={it.title}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], title: e.target.value };
                setItems(next);
              }}
              placeholder="Appointment…"
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
          onClick={() => setItems((prev) => [...prev, { when: "", title: "" }])}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add appointment
        </button>
      </div>
    </div>
  );
}
