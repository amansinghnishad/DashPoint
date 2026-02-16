import { useEffect, useMemo, useState } from "react";

export default function Clock({ showSeconds = true, className = "" }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalMs = showSeconds ? 1000 : 60_000;
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [showSeconds]);

  const timeText = useMemo(() => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds ? { second: "2-digit" } : null),
    };

    return now.toLocaleTimeString([], options);
  }, [now, showSeconds]);

  return (
    <div
      className={`dp-surface dp-border rounded-xl border px-3 py-2 ${className}`}
      aria-label="Clock"
    >
      <p className="dp-text text-sm font-semibold tabular-nums">{timeText}</p>
    </div>
  );
}
