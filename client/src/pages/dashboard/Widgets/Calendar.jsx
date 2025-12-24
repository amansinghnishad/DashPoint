import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const isSameDay = (a, b) =>
  a && b
    ? a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    : false;

const formatMonthLabel = (d) =>
  d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function CalendarWidget() {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const last = endOfMonth(month);
    const startWeekday = first.getDay();
    const totalDays = last.getDate();

    const result = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i += 1) result.push(null);
    // Month days
    for (let d = 1; d <= totalDays; d += 1) {
      result.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    // Trailing blanks (to complete weeks)
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [month]);

  const today = useMemo(() => new Date(), []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            )
          }
          className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-0 text-center">
          <p className="dp-text font-semibold truncate">
            {formatMonthLabel(month)}
          </p>
          <p className="dp-text-muted text-xs truncate">
            Selected: {selectedDate?.toLocaleDateString()}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
          className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="dp-text-muted text-center text-[11px] sm:text-xs font-semibold"
          >
            {w}
          </div>
        ))}

        {days.map((d, idx) => {
          if (!d) {
            return <div key={`blank-${idx}`} />;
          }

          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDate);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`h-9 sm:h-10 w-full rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
                isSelected
                  ? "dp-border dp-surface-muted border-2"
                  : "dp-border dp-surface dp-hover-bg"
              } ${isToday ? "ring-1 ring-inset" : ""}`}
              aria-pressed={isSelected}
              aria-label={d.toDateString()}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
