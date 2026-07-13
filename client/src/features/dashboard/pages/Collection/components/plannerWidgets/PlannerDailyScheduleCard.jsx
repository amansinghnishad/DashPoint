import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";

import { normalizeDailyScheduleData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

const withClientKeys = (blocks = []) =>
  blocks.map((block) => ({
    ...block,
    clientKey: block?.clientKey || crypto.randomUUID(),
  }));

export default function PlannerDailyScheduleCard({ widget }) {
  const widgetId = widget?._id;

  const baseline = useMemo(
    () => normalizeDailyScheduleData(widget?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetId],
  );
  const [blocks, setBlocks] = useState(() => withClientKeys(baseline.blocks));
  const [draft, setDraft] = useState({ start: "", end: "", title: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  const filledCount = blocks.filter((b) => (b.title || "").trim()).length;

  useEffect(() => {
    setBlocks(withClientKeys(baseline.blocks));
    setEditingIndex(null);
  }, [baseline, widgetId]);

  const addDraftBlock = () => {
    const title = draft.title.trim();
    if (!title) return;
    if (!draft.start || !draft.end) return;
    setBlocks((prev) => [
      ...prev,
      {
        clientKey: crypto.randomUUID(),
        start: draft.start,
        end: draft.end,
        title,
      },
    ]);
    setDraft({ start: "", end: "", title: "" });
  };

  const nextData = useMemo(() => ({ blocks }), [blocks]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="space-y-3">
      <div className="text-muted text-xs font-semibold">{filledCount} blocks</div>

      <div className="border border-hairline rounded-2xl p-3 bg-canvas-soft/30">
        {blocks.length === 0 ? (
          <div className="text-muted text-sm py-2">No blocks yet. Add one below.</div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-auto pr-1 scrollbar-thin">
            {blocks.map((b, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div
                  key={b.clientKey}
                  className="border border-hairline hover:bg-canvas-soft/55 flex items-start justify-between gap-2 rounded-xl bg-surface-card px-3 py-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[100px_100px_1fr]">
                        <input
                          type="time"
                          value={b.start}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], start: e.target.value };
                            setBlocks(next);
                          }}
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                        <input
                          type="time"
                          value={b.end}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], end: e.target.value };
                            setBlocks(next);
                          }}
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={b.title}
                          onChange={(e) => {
                            const next = [...blocks];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setBlocks(next);
                          }}
                          placeholder="What are you doing?"
                          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-ink truncate text-sm font-semibold">
                          {(b.title || "").trim() || "(Untitled)"}
                        </div>
                        <div className="text-muted-soft text-[10px] font-bold uppercase tracking-wider">
                          {(b.start || "").trim() || "--:--"} - {(b.end || "").trim() || "--:--"}
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
                      onClick={() => setBlocks((prev) => prev.filter((_, i) => i !== idx))}
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

      <div className="border border-hairline grid grid-cols-1 gap-2 rounded-2xl p-2 md:grid-cols-[100px_100px_1fr_auto] md:items-center bg-surface-card">
        <input
          type="time"
          value={draft.start}
          onChange={(e) => setDraft((prev) => ({ ...prev, start: e.target.value }))}
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
          aria-label="Start time"
        />
        <input
          type="time"
          value={draft.end}
          onChange={(e) => setDraft((prev) => ({ ...prev, end: e.target.value }))}
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
          aria-label="End time"
        />
        <input
          value={draft.title}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraftBlock();
          }}
          placeholder="What are you doing?"
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-3 py-2 text-sm outline-none"
        />
        <div className="border-l border-hairline flex items-center justify-center pl-2 h-8">
          <button
            type="button"
            onClick={addDraftBlock}
            className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-9 w-9 items-center justify-center text-lg transition-all rounded-xl shrink-0"
            aria-label="Add"
            title="Add"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
