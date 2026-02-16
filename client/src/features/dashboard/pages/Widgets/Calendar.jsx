import { ChevronLeft, ChevronRight } from "@/shared/ui/icons";
import { useMemo, useState } from "react";
import { useCalendar } from "../../../../hooks/useCalendar";

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
  const {
    selectedDate,
    setSelectedDate,
    connected,
    loadingStatus,
    loadingEvents,
    events,
    error,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  } = useCalendar();

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
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="dp-text text-sm font-semibold truncate">
            Google Calendar
          </p>
          <p className="dp-text-muted text-xs truncate">
            {loadingStatus
              ? "Checking connection..."
              : connected
              ? "Connected"
              : "Not connected"}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-red-200 truncate">
              {error?.response?.data?.message || error?.message || "Error"}
            </p>
          ) : null}
        </div>

        {connected ? (
          <button
            type="button"
            onClick={disconnectGoogleCalendar}
            className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={connectGoogleCalendar}
            className="dp-btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
            disabled={loadingStatus}
          >
            Connect
          </button>
        )}
      </div>

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

          const hasEvent =
            connected &&
            Array.isArray(events) &&
            events.some((ev) => {
              const start = ev?.start ? new Date(ev.start) : null;
              if (!start || Number.isNaN(start.getTime())) return false;
              return isSameDay(start, d);
            });

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
              <div className="flex flex-col items-center justify-center leading-none">
                <span>{d.getDate()}</span>
                {hasEvent ? (
                  <span className="mt-1 h-1 w-1 rounded-full dp-surface-muted" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="dp-text text-sm font-semibold">Events</p>
        {!connected ? (
          <p className="dp-text-muted mt-1 text-sm">
            Connect Google Calendar to see events.
          </p>
        ) : loadingEvents ? (
          <p className="dp-text-muted mt-1 text-sm">Loading events...</p>
        ) : Array.isArray(events) && events.length > 0 ? (
          <div className="mt-2 space-y-2">
            {events.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="dp-surface dp-border rounded-2xl border px-3 py-2"
              >
                <p className="dp-text text-sm font-semibold truncate">
                  {ev.summary}
                </p>
                <p className="dp-text-muted text-xs truncate">
                  {ev.start ? new Date(ev.start).toLocaleString() : ""}
                </p>
              </div>
            ))}
            {events.length > 6 ? (
              <p className="dp-text-muted text-xs">Showing first 6 events.</p>
            ) : null}
          </div>
        ) : (
          <p className="dp-text-muted mt-1 text-sm">No events for this day.</p>
        )}
      </div>
    </div>
  );
}