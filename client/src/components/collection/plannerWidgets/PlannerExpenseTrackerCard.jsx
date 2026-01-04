import { useEffect, useMemo, useState } from "react";

import { normalizeExpenseTrackerData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerExpenseTrackerCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeExpenseTrackerData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId]
  );
  const [rows, setRows] = useState(() => baseline.rows);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const n = Number(String(r.amount || "").replace(/[^0-9.-]/g, ""));
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  }, [rows]);

  useEffect(() => {
    setRows(baseline.rows);
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftRow = () => {
    const label = draftLabel.trim();
    const amount = draftAmount.trim();
    if (!label && !amount) return;
    setRows((prev) => [...prev, { label, amount }]);
    setDraftLabel("");
    setDraftAmount("");
  };

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

      <div className="dp-border rounded-2xl border p-3">
        {rows.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No expenses yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {rows.map((r, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="dp-border dp-hover-bg flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px]">
                        <input
                          value={r.label}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setRows(next);
                          }}
                          placeholder="Item"
                          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={r.amount}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx] = {
                              ...next[idx],
                              amount: e.target.value,
                            };
                            setRows(next);
                          }}
                          placeholder="Amount"
                          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="dp-text truncate text-sm font-semibold">
                          {(r.label || "").trim() || "(Unlabeled)"}
                        </div>
                        <div className="dp-text-muted text-xs">
                          {(r.amount || "").trim() || "0"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label={isEditing ? "Done editing" : "Edit"}
                      title={isEditing ? "Done" : "Edit"}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRows((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="dp-text-danger inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dp-border grid grid-cols-1 gap-2 rounded-2xl border p-2 md:grid-cols-[1fr_180px_auto] md:items-center">
        <input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder="Item"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <input
          value={draftAmount}
          onChange={(e) => setDraftAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftRow();
          }}
          placeholder="Amount"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <div className="dp-border flex items-center justify-center border-l pl-2">
          <button
            type="button"
            onClick={addDraftRow}
            className="dp-text inline-flex h-10 w-10 items-center justify-center text-lg font-semibold transition-opacity hover:opacity-80"
            aria-label="Add"
            title="Add"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
