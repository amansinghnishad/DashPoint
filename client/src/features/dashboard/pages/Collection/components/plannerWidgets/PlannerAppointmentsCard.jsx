import { useEffect, useMemo, useRef, useState } from "react";
import { IconAdd, IconDelete, IconEdit, IconTime } from "@/shared/ui/icons";
import { normalizeAppointmentsData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerAppointmentsCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeAppointmentsData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId],
  );
  const [items, setItems] = useState(() => baseline.items);
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

    setItems((prev) => [...prev, { title, when: draftWhen }]);
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
    setItems(baseline.items);
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
        <div className="dp-text-muted text-xs">{upcomingCount} upcoming</div>
      </div>

      <div className="dp-border rounded-2xl border p-3">
        {items.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No appointments yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {items.map((it, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="dp-hover-bg flex items-start justify-between gap-2 rounded-xl px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr]">
                        <input
                          type="datetime-local"
                          value={it.when}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], when: e.target.value };
                            setItems(next);
                          }}
                          className=" dp-text w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={it.title}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setItems(next);
                          }}
                          placeholder="Appointment..."
                          className=" dp-text w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="dp-text truncate text-sm font-semibold">
                          {(it.title || "").trim() || "(Untitled)"}
                        </div>
                        <div className="dp-text-muted text-xs">
                          {formatWhen(it.when) || "No date/time"}
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
                      className="inline-flex h-9 w-9 items-center justify-center text-sm transition-colors"
                      aria-label={isEditing ? "Done editing" : "Edit"}
                      title={isEditing ? "Done" : "Edit"}
                    >
                      <IconEdit size={14} />
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
                      <IconDelete size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dp-border flex items-center gap-2 rounded-2xl border p-2">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftAppointment();
          }}
          placeholder="Appointment..."
          className=" dp-text w-full rounded-xl px-3 py-2 text-sm outline-none"
        />

        <div className="dp-border h-8 border-l" />

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
          className=" inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors"
          aria-label="Pick date/time"
          title="Pick date/time"
        >
          <IconTime size={14} />
        </button>

        <button
          type="button"
          onClick={addDraftAppointment}
          className="dp-text inline-flex h-10 w-10 items-center justify-center text-lg font-semibold transition-opacity hover:opacity-80"
          aria-label="Add"
          title="Add"
        >
          <IconAdd size={14} />
        </button>
      </div>
    </div>
  );
}
