import { dayKey, isSameDay } from "../utils/dateUtils";
import { getEventChipClass } from "../utils/eventUtils";

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
    <div className="dp-surface dp-border rounded-2xl border overflow-hidden">
      <div className="grid grid-cols-7 border-b dp-border">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="px-3 py-2 dp-text-muted text-xs font-semibold"
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
                "min-h-[92px] border-b border-r dp-border p-2 text-left transition-colors " +
                (isSelected ? "dp-surface-muted" : "dp-hover-bg")
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-lg text-xs font-semibold " +
                    (inMonth ? "dp-text" : "dp-text-muted") +
                    (isTodayCell ? " ring-1 ring-inset" : "")
                  }
                  aria-label={date.toDateString()}
                >
                  {date.getDate()}
                </div>
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
                    <p className="dp-text text-xs font-semibold truncate">
                      {event.summary}
                    </p>
                  </div>
                ))}

                {dayEvents.length > 3 ? (
                  <p className="dp-text-muted text-xs">+{dayEvents.length - 3} more</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
