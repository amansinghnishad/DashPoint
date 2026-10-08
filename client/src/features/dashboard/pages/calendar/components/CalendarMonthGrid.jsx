import { dayKey, isSameDay } from "../utils/dateUtils";

const getWeekDays = (selectedDate) => {
  const firstDay = new Date(selectedDate);
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    return date;
  });
};

export default function CalendarMonthGrid({
  selectedDate,
  today,
  eventsByDay,
  onSelectDate,
}) {
  const weekDays = getWeekDays(selectedDate);

  return (
    <section className="border-y border-hairline py-3" aria-label="Choose a day">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 sm:justify-between">
        {weekDays.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const eventCount = eventsByDay.get(dayKey(date))?.length ?? 0;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={selected}
              aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}${eventCount ? `, ${eventCount} events` : ""}`}
              className="group flex min-w-[48px] snap-center flex-col items-center gap-1.5 text-ink sm:min-w-[56px]"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-all sm:h-11 sm:w-11 ${
                selected
                  ? "border-ink bg-ink text-canvas shadow-md shadow-ink/10"
                  : isToday
                    ? "border-ink/30 bg-surface-card text-ink hover:border-ink/60"
                    : "border-transparent bg-transparent text-ink hover:border-hairline hover:bg-canvas-soft"
              }`}>{date.getDate()}</span>
              <span className="flex h-1 items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: Math.min(eventCount, 3) }, (_, index) => (
                  <span key={index} className={`h-1 w-1 rounded-full ${selected ? "bg-ink" : "bg-primary"}`} />
                ))}
                {isToday && !selected && eventCount === 0 ? <span className="h-1 w-1 rounded-full bg-ink/50" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
