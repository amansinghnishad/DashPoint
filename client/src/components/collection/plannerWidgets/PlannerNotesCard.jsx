import { useEffect, useMemo, useState } from "react";

import { normalizeNotesData } from "./normalize";
import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

export default function PlannerNotesCard({ widget }) {
  const widgetId = widget?._id;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseline = useMemo(() => normalizeNotesData(widget?.data), [widgetId]);
  const [text, setText] = useState(() => baseline.text);

  useEffect(() => {
    setText(baseline.text);
  }, [baseline, widgetId]);

  const nextData = useMemo(() => ({ text }), [text]);
  usePlannerWidgetAutosave({
    widgetId,
    data: nextData,
    baselineSerialized: JSON.stringify(baseline),
  });

  return (
    <div className="h-full flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write notes…"
        className="dp-surface dp-border dp-text w-full flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none"
      />
      <div className="dp-text-muted text-xs">Autosaves</div>
    </div>
  );
}
