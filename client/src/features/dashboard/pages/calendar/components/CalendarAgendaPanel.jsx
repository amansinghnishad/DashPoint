import { CalendarDays } from "@/shared/ui/icons/icons";
import { Trash2 } from "lucide-react";
import { formatEventTimeLabel } from "../utils/eventUtils";

const getTypeLabel = (type) => {
  if (type === "todo") return "To-do";
  if (type === "task") return "Task";
  return "Event";
};

const getTimelineColor = (event) => {
  switch (event?.dashpointColor) {
    case "success": return "bg-emerald-500";
    case "warning": return "bg-amber-500";
    case "danger": return "bg-rose-500";
    default:
      if (event?.dashpointType === "task") return "bg-violet-500";
      if (event?.dashpointType === "todo") return "bg-amber-500";
      return "bg-blue-500";
  }
};

const getTypeBadgeClass = (type) => {
  if (type === "todo") return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (type === "task") return "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300";
};

const getDateLabel = (date) => date instanceof Date
  ? date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  : "Selected day";

export default function CalendarAgendaPanel({
  selectedDayEvents = [],
  selectedDate,
  connected = false,
  loading = false,
  onConnect,
  onDeleteEvent,
  deletingEventId,
}) {
  const events = Array.isArray(selectedDayEvents) ? selectedDayEvents : [];
  if (loading) return null;
  const dateLabel = getDateLabel(selectedDate);

  if (!events.length) {
    return (
      <section className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface-card" aria-label={`Schedule for ${dateLabel}`}>
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3 sm:px-5">
          <CalendarDays size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-ink">{dateLabel}</h2>
        </div>
        <div className="px-5 py-7 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-soft text-muted">
            <CalendarDays size={18} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-ink">
            {connected ? "Nothing scheduled" : "Connect your calendar"}
          </h3>
          <p className="mx-auto mt-1 max-w-[448px] text-xs leading-5 text-muted">
            {connected
              ? "Your day is clear. Events and tasks for this day will appear here."
              : "Connect Google Calendar to see your events and tasks here."}
          </p>
          {!connected ? (
            <button
              type="button"
              onClick={onConnect}
              className="dp-btn-primary mt-4 h-9 rounded-full px-4 text-xs font-semibold"
            >
              Connect Google Calendar
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5" aria-label={`Schedule for ${dateLabel}`}>
      <div className="mb-1 flex items-center justify-between border-b border-hairline pb-2.5">
        <h2 className="text-sm font-semibold text-ink">{dateLabel}</h2>
        <span className="text-xs text-muted">{events.length} {events.length === 1 ? "item" : "items"}</span>
      </div>
      <div className="divide-y divide-hairline/60">
        {events.map((event, index) => {
          const timeLabel = formatEventTimeLabel(event);
          return (
            <article key={event.id} className="grid grid-cols-[62px_12px_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[76px_12px_minmax(0,1fr)] sm:gap-4">
              <div className="pt-1 text-right">
                <p className="text-[10px] font-semibold tabular-nums text-ink sm:text-xs">{timeLabel || "All day"}</p>
              </div>
              <div className="relative flex justify-center" aria-hidden="true">
                <span className={`mt-1.5 h-2 w-2 rounded-full ring-4 ring-canvas ${getTimelineColor(event)}`} />
                {index < events.length - 1 ? <span className="absolute bottom-[-14px] top-4 w-px bg-hairline/70" /> : null}
              </div>
              <div className="min-w-0 rounded-xl border border-hairline/70 bg-surface-card px-3.5 py-3 transition-colors hover:bg-canvas-soft/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="min-w-0 truncate text-xs font-semibold text-ink sm:text-sm">{event?.summary || "Untitled event"}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getTypeBadgeClass(event?.dashpointType)}`}>{getTypeLabel(event?.dashpointType)}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent?.(event)}
                      disabled={Boolean(deletingEventId)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-semantic-error/10 hover:text-semantic-error disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete ${getTypeLabel(event?.dashpointType).toLowerCase()} ${event?.summary || "calendar item"}`}
                      title="Delete from Google Calendar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {event?.description ? <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted sm:text-xs">{event.description}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
