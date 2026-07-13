import { useEffect, useMemo, useState } from "react";

import { usePlannerWidgetAutosave } from "./usePlannerWidgetAutosave";

const normalizeNotesData = (data) => ({
  text: typeof data?.text === "string" ? data.text : "",
});

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
    <div className="h-full flex flex-col gap-2.5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write notes..."
        className="bg-canvas border border-hairline text-ink w-full flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted/65"
      />
      <div className="text-muted text-[10px] font-bold uppercase tracking-wider shrink-0 pl-1">Autosaved</div>
    </div>
  );
}
