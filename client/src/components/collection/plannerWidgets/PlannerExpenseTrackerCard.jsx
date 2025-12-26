import { useEffect, useMemo, useState } from "react";

import { normalizeExpenseTrackerData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerExpenseTrackerCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeExpenseTrackerData(widget?.data),
    [widgetId]
  );
  const [rows, setRows] = useState(() => baseline.rows);

  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const n = Number(String(r.amount || "").replace(/[^0-9.-]/g, ""));
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  }, [rows]);

  useEffect(() => {
    setRows(baseline.rows);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ rows }), [rows]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="dp-text-muted text-xs">Total</p>
        <p className="dp-text text-sm font-semibold">{total.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2">
            <input
              value={r.label}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], label: e.target.value };
                setRows(next);
              }}
              placeholder="Item"
              className="dp-surface dp-border dp-text col-span-7 rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              value={r.amount}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], amount: e.target.value };
                setRows(next);
              }}
              placeholder="Amount"
              className="dp-surface dp-border dp-text col-span-4 rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setRows((prev) => prev.filter((_, i) => i !== idx))
              }
              className="dp-btn-secondary col-span-1 rounded-xl px-0 py-2 text-sm font-semibold transition-colors"
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
            setRows((prev) => [...prev, { label: "", amount: "" }])
          }
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add expense
        </button>
      </div>
    </div>
  );
}
