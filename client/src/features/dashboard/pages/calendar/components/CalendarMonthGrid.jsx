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
    <div className="bg-surface-card border border-hairline overflow-hidden rounded-2xl shadow-sm">
      <div className="grid grid-cols-7 border-b border-hairline bg-canvas-soft select-none">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="px-4 py-2.5 text-muted text-[10px] font-bold uppercase tracking-wider text-center sm:text-left"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-hairline/60">
        {monthGrid.map((date, idx) => {
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
                "group min-h-[96px] p-2.5 text-left transition-all duration-200 ease-out lg:min-h-[118px] relative " +
                (isSelected
                  ? "bg-canvas-soft/80"
                  : "hover:bg-canvas-soft/30") +
                // Fix grid borders since grid division applies to children
                (idx < 7 ? " border-t-0" : "") +
                (idx % 7 === 0 ? " border-l-0" : "")
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    "text-xs font-semibold select-none " +
                    (inMonth ? "text-ink" : "text-muted-soft") +
                    (isTodayCell
                      ? " bg-ink text-canvas rounded-full h-6 w-6 inline-flex items-center justify-center shadow-sm"
                      : " group-hover:text-ink h-6 w-6 inline-flex items-center justify-center rounded-lg hover:bg-canvas-soft")
                  }
                  aria-label={date.toDateString()}
                >
                  {date.getDate()}
                </div>

                {dayEvents.length ? (
                  <span className="text-[10px] font-bold text-muted bg-canvas-soft px-1.5 py-0.5 rounded-full select-none">
                    {dayEvents.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-2.5 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={
                      "border border-hairline/60 bg-canvas-soft/40 rounded-lg px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:bg-canvas-soft transition-colors " + getEventChipClass(event)
                    }
                    title={event.summary}
                  >
                    <p className="text-ink text-[11px] font-semibold truncate leading-tight">{event.summary}</p>
                    <p className="text-muted-soft mt-0.5 text-[9px] truncate">
                      {formatEventTimeLabel(event) || "All day"}
                    </p>
                  </div>
                ))}

                {dayEvents.length > 3 ? (
                  <p className="text-muted text-[10px] font-semibold select-none pl-1">+{dayEvents.length - 3} more</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
