import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Edit2, Clock } from "lucide-react";

import { normalizeAppointmentsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

const withClientKeys = (items = []) =>
  items.map((item) => ({
    ...item,
    clientKey: item?.clientKey || crypto.randomUUID(),
  }));

export default function PlannerAppointmentsCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeAppointmentsData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId],
  );
  const [items, setItems] = useState(() => withClientKeys(baseline.items));
  const [draftTitle, setDraftTitle] = useState("");
  const [draftWhen, setDraftWhen] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const draftWhenRef = useRef(null);

  const formatWhen = (when) => {
    if (!when) return "";
    const ts = new Date(when).getTime();
    if (!Number.isFinite(ts)) return "";
    try {
      return new Date(ts).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const addDraftAppointment = () => {
    const title = draftTitle.trim();
    if (!title) return;
    if (!draftWhen) return;

    setItems((prev) => [...prev, { clientKey: crypto.randomUUID(), title, when: draftWhen }]);
    setDraftTitle("");
    setDraftWhen("");
  };

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
    setItems(withClientKeys(baseline.items));
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ items }), [items]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-muted text-xs font-semibold">{upcomingCount} upcoming</div>
      </div>

      <div className="border border-hairline rounded-2xl p-3 bg-canvas-soft/30">
        {items.length === 0 ? (
          <div className="text-muted text-sm py-2">No appointments yet. Add one below.</div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1 scrollbar-thin">
            {items.map((it, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={it.clientKey}
                  className="hover:bg-canvas-soft/50 flex items-start justify-between gap-2 rounded-xl px-3 py-2 transition-colors bg-surface-card border border-hairline"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr]">
                        <input
                          type="datetime-local"
                          value={it.when}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], when: e.target.value };
                            setItems(next);
                          }}
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={it.title}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setItems(next);
                          }}
                          placeholder="Appointment..."
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-ink truncate text-sm font-semibold">
                          {(it.title || "").trim() || "(Untitled)"}
                        </div>
                        <div className="text-muted-soft text-xs flex items-center gap-1">
                          <Clock size={11} className="text-muted-soft" />
                          <span>{formatWhen(it.when) || "No date/time"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIndex((prev) => (prev === idx ? null : idx))}
                      className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label={isEditing ? "Done editing" : "Edit"}
                      title={isEditing ? "Done" : "Edit"}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border border-hairline flex items-center gap-2 rounded-2xl p-2 bg-surface-card">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftAppointment();
          }}
          placeholder="Appointment..."
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
        />

        <div className="border-l border-hairline h-8" />

        <input
          ref={draftWhenRef}
          type="datetime-local"
          value={draftWhen}
          onChange={(e) => setDraftWhen(e.target.value)}
          className="sr-only"
          aria-label="Appointment date/time"
        />

        <button
          type="button"
          onClick={() => {
            const el = draftWhenRef.current;
            if (!el) return;
            if (typeof el.showPicker === "function") el.showPicker();
            else el.click();
          }}
          className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors shrink-0"
          aria-label="Pick date/time"
          title="Pick date/time"
        >
          <Clock size={15} />
        </button>

        <button
          type="button"
          onClick={addDraftAppointment}
          className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-9 w-9 items-center justify-center text-lg transition-all rounded-xl shrink-0"
          aria-label="Add"
          title="Add"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
