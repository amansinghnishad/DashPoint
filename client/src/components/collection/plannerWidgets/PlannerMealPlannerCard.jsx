import { useEffect, useMemo, useState } from "react";

import { normalizeMealPlannerData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerMealPlannerCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeMealPlannerData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId]
  );
  const [items, setItems] = useState(() => baseline.items);
  const [draftDay, setDraftDay] = useState("");
  const [draftMeal, setDraftMeal] = useState("");
  const [draftText, setDraftText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const filledCount = useMemo(
    () => items.filter((it) => (it.text || "").trim()).length,
    [items]
  );

  useEffect(() => {
    setItems(baseline.items);
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftMeal = () => {
    const text = draftText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { day: draftDay, meal: draftMeal, text }]);
    setDraftDay("");
    setDraftMeal("");
    setDraftText("");
  };

  const nextData = useMemo(() => ({ items }), [items]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{filledCount} planned meals</div>

      <div className="dp-border rounded-2xl border p-3">
        {items.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No meals yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {items.map((it, idx) => {
              const isEditing = editingIndex === idx;
              const label = [it.day, it.meal].filter(Boolean).join(" • ");

              return (
                <div
                  key={idx}
                  className="dp-border dp-hover-bg flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[140px_140px_1fr]">
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
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="dp-text truncate text-sm font-semibold">
                          {(it.text || "").trim() || "(Untitled)"}
                        </div>
                        <div className="dp-text-muted text-xs">
                          {label || "No day/meal"}
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
                        setItems((prev) => prev.filter((_, i) => i !== idx))
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

      <div className="dp-border grid grid-cols-1 gap-2 rounded-2xl border p-2 md:grid-cols-[140px_140px_1fr_auto] md:items-center">
        <select
          value={draftDay}
          onChange={(e) => setDraftDay(e.target.value)}
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
          value={draftMeal}
          onChange={(e) => setDraftMeal(e.target.value)}
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        >
          <option value="">Meal</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
        <input
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftMeal();
          }}
          placeholder="Meal"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <div className="dp-border flex items-center justify-center border-l pl-2">
          <button
            type="button"
            onClick={addDraftMeal}
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
