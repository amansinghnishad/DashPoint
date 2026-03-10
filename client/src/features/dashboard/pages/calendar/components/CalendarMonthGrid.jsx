import { dayKey, isSameDay } from "../utils/dateUtils";
import { formatEventTimeLabel, getEventChipClass } from "../utils/eventUtils";

export default function CalendarMonthGrid({
  month,
  monthGrid,
  weekdays,
  selectedDate,
  today,
  eventsByDay,
  onSelectDate,
}) {
  return (
    <div className="dp-surface dp-border overflow-hidden rounded-2xl border">
      <div className="grid grid-cols-7 border-b dp-border dp-surface-muted">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="px-3 py-2 dp-text-muted text-[11px] font-semibold uppercase tracking-wide"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthGrid.map((date) => {
          const inMonth = date.getMonth() === month.getMonth();
          const isTodayCell = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const dayEvents = eventsByDay.get(dayKey(date)) || [];

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={
                "group min-h-[96px] border-b border-r dp-border p-2 text-left transition-all motion-safe:duration-200 motion-safe:ease-out lg:min-h-[118px] " +
                (isSelected
                  ? "dp-surface-muted shadow-[inset_0_0_0_1px_var(--dp-border)]"
                  : "dp-hover-bg")
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg text-xs font-semibold transition-all motion-safe:duration-200 motion-safe:ease-out " +
                    (inMonth ? "dp-text" : "dp-text-muted") +
                    (isTodayCell
                      ? " ring-1 ring-inset ring-[var(--dp-toast-info)]"
                      : " group-hover:dp-surface")
                  }
                  aria-label={date.toDateString()}
                >
                  {date.getDate()}
                </div>

                {dayEvents.length ? (
                  <span className="dp-text-subtle text-[10px] font-semibold">
                    {dayEvents.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={
                      "dp-surface dp-border rounded-lg border px-2 py-1 " +
                      getEventChipClass(event)
                    }
                    title={event.summary}
                  >
                    <p className="dp-text text-[11px] font-semibold truncate">
                      {event.summary}
                    </p>
                    <p className="dp-text-subtle mt-0.5 text-[10px] truncate">
                      {formatEventTimeLabel(event) || "Time"}
                    </p>
                  </div>
                ))}

                {dayEvents.length > 3 ? (
                  <p className="dp-text-muted text-[11px]">+{dayEvents.length - 3} more</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
