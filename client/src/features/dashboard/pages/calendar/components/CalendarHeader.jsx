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
    <div className="relative overflow-hidden rounded-2xl border dp-border dp-surface p-4 lg:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-8 right-8 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-12 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="dp-text-muted" />
            <h1 className="dp-text text-lg font-semibold truncate">Calendar Workspace</h1>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="dp-text-muted text-sm">{monthLabel}</p>
            <span className="dp-text-subtle text-xs">|</span>
            <p className="dp-text-subtle text-xs">Selected: {formatSelectedDate(selectedDate)}</p>
            <span
              className={
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold " +
                (connected
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400")
              }
            >
              {connected ? "Google connected" : "Google disconnected"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              {loadingStatus ? "Connecting..." : "Connect"}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreate}
            className="dp-btn-primary inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <Plus size={14} />
            Create
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="dp-btn-secondary inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
            disabled={monthLoading}
          >
            <RotateCcw size={14} />
            {monthLoading ? "Syncing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={onGoToToday}
            className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
          >
            Today
          </button>

          <button
            type="button"
            onClick={onGoToPreviousMonth}
            className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={onGoToNextMonth}
            className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {connectError ? (
        <p className="dp-text-danger relative z-10 mt-3 text-xs truncate">
          {connectError?.response?.data?.message || connectError?.message || "Calendar error"}
        </p>
      ) : null}

      {monthError ? (
        <p className="dp-text-danger relative z-10 mt-1 text-xs truncate">
          {monthError?.response?.data?.message || monthError?.message || "Failed to load events"}
        </p>
      ) : null}
    </div>
  );
}
