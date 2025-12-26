import { useEffect, useMemo, useState } from "react";

import { normalizeDailyScheduleData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerDailyScheduleCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeDailyScheduleData(widget?.data),
    [widgetId]
  );
  const [blocks, setBlocks] = useState(() => baseline.blocks);

  const filledCount = useMemo(
    () => blocks.filter((b) => (b.title || "").trim()).length,
    [blocks]
  );

  useEffect(() => {
    setBlocks(baseline.blocks);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ blocks }), [blocks]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{filledCount} blocks</div>

      <div className="space-y-2">
        {blocks.map((b, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-2 md:grid-cols-[120px_120px_1fr_auto] md:items-center"
          >
            <input
              type="time"
              value={b.start}
              onChange={(e) => {
                const next = [...blocks];
                next[idx] = { ...next[idx], start: e.target.value };
                setBlocks(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              type="time"
              value={b.end}
              onChange={(e) => {
                const next = [...blocks];
                next[idx] = { ...next[idx], end: e.target.value };
                setBlocks(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              value={b.title}
              onChange={(e) => {
                const next = [...blocks];
                next[idx] = { ...next[idx], title: e.target.value };
                setBlocks(next);
              }}
              placeholder="What are you doing?"
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setBlocks((prev) => prev.filter((_, i) => i !== idx))
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
            setBlocks((prev) => [...prev, { start: "", end: "", title: "" }])
          }
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add block
        </button>
      </div>
    </div>
  );
}
