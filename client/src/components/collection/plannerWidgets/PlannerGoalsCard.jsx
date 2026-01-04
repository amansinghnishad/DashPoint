import { useEffect, useMemo, useState } from "react";

import { normalizeGoalsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerGoalsCard({ widget }) {
  const widgetId = widget?._id;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseline = useMemo(() => normalizeGoalsData(widget?.data), [widgetId]);
  const [goals, setGoals] = useState(() => baseline.goals);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDue, setDraftDue] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const completedCount = useMemo(
    () => goals.filter((g) => g.title.trim() && g.done).length,
    [goals]
  );

  useEffect(() => {
    setGoals(baseline.goals);
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftGoal = () => {
    const title = draftTitle.trim();
    if (!title) return;
    setGoals((prev) => [...prev, { done: false, title, due: draftDue }]);
    setDraftTitle("");
    setDraftDue("");
  };

  const nextData = useMemo(() => ({ goals }), [goals]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{completedCount} completed</div>

      <div className="dp-border rounded-2xl border p-3">
        {goals.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No goals yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {goals.map((g, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="dp-border dp-hover-bg flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[auto_1fr_180px] md:items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(g.done)}
                          onChange={(e) => {
                            const next = [...goals];
                            next[idx] = {
                              ...next[idx],
                              done: e.target.checked,
                            };
                            setGoals(next);
                          }}
                          className="h-4 w-4"
                          aria-label={g.done ? "Mark not done" : "Mark done"}
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
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(g.done)}
                          onChange={(e) => {
                            const next = [...goals];
                            next[idx] = {
                              ...next[idx],
                              done: e.target.checked,
                            };
                            setGoals(next);
                          }}
                          className="mt-1 h-4 w-4"
                          aria-label={g.done ? "Mark not done" : "Mark done"}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="dp-text truncate text-sm font-semibold">
                            {(g.title || "").trim() || "(Untitled)"}
                          </div>
                          <div className="dp-text-muted text-xs">
                            {(g.due || "").trim()
                              ? `Due ${g.due}`
                              : "No due date"}
                          </div>
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
                        setGoals((prev) => prev.filter((_, i) => i !== idx))
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
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftGoal();
          }}
          placeholder="Goal"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <input
          type="date"
          value={draftDue}
          onChange={(e) => setDraftDue(e.target.value)}
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
          aria-label="Due date"
        />
        <div className="dp-border flex items-center justify-center border-l pl-2">
          <button
            type="button"
            onClick={addDraftGoal}
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
