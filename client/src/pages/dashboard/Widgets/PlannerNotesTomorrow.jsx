import { useState } from "react";

export default function PlannerNotesTomorrowWidget() {
  const [value, setValue] = useState("");

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Notes for tomorrow…"
      className="dp-surface dp-border dp-text w-full min-h-[180px] resize-y rounded-xl border px-4 py-3 text-sm outline-none"
    />
  );
}
