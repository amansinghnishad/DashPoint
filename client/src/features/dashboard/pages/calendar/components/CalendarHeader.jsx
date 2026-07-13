import { CalendarDays, ChevronLeft, ChevronRight, Plus, RotateCcw } from "@/shared/ui/icons/icons";

const formatSelectedDate = (value) =>
  value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function CalendarHeader({
  monthLabel,
  selectedDate,
  connected,
  loadingStatus,
  connectError,
  monthError,
  monthLoading,
  onConnect,
  onDisconnect,
  onOpenCreate,
  onRefresh,
  onGoToToday,
  onGoToPreviousMonth,
  onGoToNextMonth,
}) {
  return (
    <div className="relative overflow-hidden bg-surface-card border border-hairline p-5 rounded-2xl shadow-sm mb-6">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-muted" />
            <h1 className="font-waldenburg-light text-xl font-bold text-ink truncate leading-none">Calendar Workspace</h1>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider">{monthLabel}</p>
            <span className="text-hairline-strong text-xs">|</span>
            <p className="text-muted-soft text-xs font-medium">Selected: {formatSelectedDate(selectedDate)}</p>
            <span
              className={
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                (connected
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400")
              }
            >
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="bg-primary hover:bg-primary-active text-canvas rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
              disabled={loadingStatus}
            >
              {loadingStatus ? "Connecting..." : "Connect"}
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
            disabled={monthLoading}
          >
            <RotateCcw size={13} />
            {monthLoading ? "Syncing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={onGoToToday}
            className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
          >
            Today
          </button>

          <div className="flex items-center border border-hairline rounded-full overflow-hidden h-7 bg-canvas-soft">
            <button
              type="button"
              onClick={onGoToPreviousMonth}
              className="px-2.5 h-full hover:bg-hairline/30 text-muted hover:text-ink transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-px h-full bg-hairline" />
            <button
              type="button"
              onClick={onGoToNextMonth}
              className="px-2.5 h-full hover:bg-hairline/30 text-muted hover:text-ink transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {connectError ? (
        <p className="text-semantic-error relative z-10 mt-3 text-xs font-semibold truncate">
          {connectError?.response?.data?.message || connectError?.message || "Calendar error"}
        </p>
      ) : null}

      {monthError ? (
        <p className="text-semantic-error relative z-10 mt-2 text-xs font-semibold truncate">
          {monthError?.response?.data?.message || monthError?.message || "Failed to load events"}
        </p>
      ) : null}
    </div>
  );
}
