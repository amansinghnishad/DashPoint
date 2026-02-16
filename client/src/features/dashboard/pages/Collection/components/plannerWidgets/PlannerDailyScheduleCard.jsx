import { useEffect, useMemo, useState } from "react";

import { normalizeDailyScheduleData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";
import { IconAdd, IconDelete, IconEdit } from "@/shared/ui/icons";

export default function PlannerDailyScheduleCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeDailyScheduleData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId],
  );
  const [blocks, setBlocks] = useState(() => baseline.blocks);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const filledCount = useMemo(
    () => blocks.filter((b) => (b.title || "").trim()).length,
    [blocks],
  );

  useEffect(() => {
    setBlocks(baseline.blocks);
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftBlock = () => {
    const title = draftTitle.trim();
    if (!title) return;
    if (!draftStart || !draftEnd) return;
    setBlocks((prev) => [...prev, { start: draftStart, end: draftEnd, title }]);
    setDraftStart("");
    setDraftEnd("");
    setDraftTitle("");
  };

  const nextData = useMemo(() => ({ blocks }), [blocks]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="dp-text-muted text-xs">{filledCount} blocks</div>

      <div className="dp-border rounded-2xl border p-3">
        {blocks.length === 0 ? (
          <div className="dp-text-muted text-sm">
            No blocks yet. Add one below.
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {blocks.map((b, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={idx}
                  className="dp-border dp-hover-bg flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[120px_120px_1fr]">
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
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="dp-text truncate text-sm font-semibold">
                          {(b.title || "").trim() || "(Untitled)"}
                        </div>
                        <div className="dp-text-muted text-xs">
                          {(b.start || "").trim() || "--:--"} -{" "}
                          {(b.end || "").trim() || "--:--"}
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
                      <IconEdit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBlocks((prev) => prev.filter((_, i) => i !== idx))
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

      <div className="dp-border grid grid-cols-1 gap-2 rounded-2xl border p-2 md:grid-cols-[120px_120px_1fr_auto] md:items-center">
        <input
          type="time"
          value={draftStart}
          onChange={(e) => setDraftStart(e.target.value)}
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <input
          type="time"
          value={draftEnd}
          onChange={(e) => setDraftEnd(e.target.value)}
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftBlock();
          }}
          placeholder="What are you doing?"
          className="dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <div className="dp-border flex items-center justify-center border-l pl-2">
          <button
            type="button"
            onClick={addDraftBlock}
            className="dp-text inline-flex h-10 w-10 items-center justify-center text-lg font-semibold transition-opacity hover:opacity-80"
            aria-label="Add"
            title="Add"
          >
            <IconAdd size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
