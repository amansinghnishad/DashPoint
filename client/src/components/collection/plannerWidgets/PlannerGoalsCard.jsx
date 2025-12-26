import { useEffect, useMemo, useState } from "react";

import { normalizeGoalsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerGoalsCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(() => normalizeGoalsData(widget?.data), [widgetId]);
  const [goals, setGoals] = useState(() => baseline.goals);

  const completedCount = useMemo(
    () => goals.filter((g) => g.title.trim() && g.done).length,
    [goals]
  );

  useEffect(() => {
    setGoals(baseline.goals);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ goals }), [goals]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{completedCount} completed</div>

      <div className="space-y-2">
        {goals.map((g, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-2 md:grid-cols-[auto_1fr_150px_auto] md:items-center"
          >
            <input
              type="checkbox"
              checked={Boolean(g.done)}
              onChange={(e) => {
                const next = [...goals];
                next[idx] = { ...next[idx], done: e.target.checked };
                setGoals(next);
              }}
              className="h-4 w-4"
            />
            <input
              value={g.title}
              onChange={(e) => {
                const next = [...goals];
                next[idx] = { ...next[idx], title: e.target.value };
                setGoals(next);
              }}
              placeholder="Goal…"
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              type="date"
              value={g.due}
              onChange={(e) => {
                const next = [...goals];
                next[idx] = { ...next[idx], due: e.target.value };
                setGoals(next);
              }}
              className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setGoals((prev) => prev.filter((_, i) => i !== idx))
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
            setGoals((prev) => [...prev, { done: false, title: "", due: "" }])
          }
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add goal
        </button>
      </div>
    </div>
  );
}
