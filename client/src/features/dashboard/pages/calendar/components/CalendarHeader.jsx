import { CalendarDays, ChevronLeft, ChevronRight, Plus, RotateCcw } from "@/shared/ui/icons/icons";

export default function CalendarHeader({
  monthLabel,
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
    <div className="mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarDays size={19} className="text-muted" />
          <h1 className="font-waldenburg-light text-xl font-semibold leading-none text-ink sm:text-2xl">{monthLabel}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-card p-1">
            {connected ? (
              <button
                type="button"
                onClick={onDisconnect}
                disabled={loadingStatus}
                className="dp-btn-secondary h-8 rounded-full px-3 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Disconnect Google Calendar"
              >
                {loadingStatus ? "Updating..." : "Disconnect"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnect}
                disabled={loadingStatus}
                className="dp-btn-secondary h-8 rounded-full px-3 text-[10px] font-semibold transition-colors disabled:opacity-50"
              >
                {loadingStatus ? "Connecting..." : "Connect"}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCreate}
              disabled={!connected}
              title={connected ? "Add an event" : "Connect your calendar to add events"}
              className="dp-btn-primary inline-flex h-8 items-center gap-1 rounded-full px-3 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={13} /> Add event
            </button>
          </div>

          <span className="mx-0.5 hidden h-6 w-px bg-hairline sm:block" aria-hidden="true" />
          <button type="button" onClick={onGoToToday} className="dp-btn-secondary h-9 rounded-full px-3.5 text-xs font-medium">Today</button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={monthLoading}
            className="dp-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50"
            aria-label={monthLoading ? "Refreshing calendar" : "Refresh calendar"}
            title={monthLoading ? "Refreshing..." : "Refresh calendar"}
          >
            <RotateCcw size={14} className={monthLoading ? "animate-spin" : ""} />
          </button>
          <div className="inline-flex h-9 items-center overflow-hidden rounded-full border border-hairline bg-surface-card">
            <button type="button" onClick={onGoToPreviousMonth} className="grid h-full w-9 place-items-center text-muted transition-colors hover:bg-canvas-soft hover:text-ink" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="h-4 w-px bg-hairline" aria-hidden="true" />
            <button type="button" onClick={onGoToNextMonth} className="grid h-full w-9 place-items-center text-muted transition-colors hover:bg-canvas-soft hover:text-ink" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {connectError ? <p role="alert" className="mt-2 text-xs font-medium text-semantic-error">{connectError?.response?.data?.message || connectError?.message || "Calendar error"}</p> : null}
      {monthError ? <p role="alert" className="mt-1 text-xs font-medium text-semantic-error">{monthError?.response?.data?.message || monthError?.message || "Failed to load events"}</p> : null}
    </div>
  );
}
