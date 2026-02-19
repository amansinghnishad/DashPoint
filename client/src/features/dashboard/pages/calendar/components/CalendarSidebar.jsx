import { ChevronLeft, ChevronRight } from "@/shared/ui/icons";
import { isSameDay } from "../utils/dateUtils";

export default function CalendarSidebar({
  month,
  monthLabel,
  monthGrid,
  weekdays,
  selectedDate,
  today,
  connected,
  loadingStatus,
  connectError,
  monthError,
  monthLoading,
  onSelectDate,
  onOpenCreate,
  onConnect,
  onDisconnect,
  onGoToPreviousMonth,
  onGoToNextMonth,
  onRefresh,
}) {
  return (
    <aside className="dp-surface dp-border rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenCreate}
          className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Create
        </button>

        <div className="flex items-center gap-2">
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="dp-btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
              disabled={loadingStatus}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="dp-text text-sm font-semibold truncate">Google Calendar</p>
          <p className="dp-text-muted text-xs truncate">
            {loadingStatus
              ? "Checking connection..."
              : connected
              ? "Connected"
              : "Not connected"}
          </p>

          {connectError ? (
            <p className="mt-1 text-xs text-red-200 truncate">
              {connectError?.response?.data?.message ||
                connectError?.message ||
                "Error"}
            </p>
          ) : null}

          {monthError ? (
            <p className="mt-1 text-xs text-red-200 truncate">
              {monthError?.response?.data?.message || monthError?.message || "Error"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onGoToPreviousMonth}
          className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <p className="dp-text text-sm font-semibold truncate">{monthLabel}</p>

        <button
          type="button"
          onClick={onGoToNextMonth}
          className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="dp-text-muted text-center text-[11px] font-semibold"
          >
            {weekday.slice(0, 1)}
          </div>
        ))}

        {monthGrid.map((date) => {
          const inMonth = date.getMonth() === month.getMonth();
          const isSelected = isSameDay(date, selectedDate);
          const isTodayCell = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={
                "h-8 w-full rounded-lg text-xs font-semibold transition-colors " +
                (isSelected ? "dp-surface-muted dp-border border" : "dp-hover-bg") +
                (inMonth ? " dp-text" : " dp-text-muted") +
                (isTodayCell ? " ring-1 ring-inset" : "")
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onRefresh}
          className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
        >
          Refresh
        </button>
        <p className="dp-text-muted text-xs">
          {monthLoading ? "Loading..." : connected ? "Synced" : ""}
        </p>
      </div>
    </aside>
  );
}
