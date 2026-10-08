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
    default: return "bg-blue-500";
  }
};

export default function CalendarAgendaPanel({ selectedDayEvents = [] }) {
  const events = Array.isArray(selectedDayEvents) ? selectedDayEvents : [];
  if (!events.length) return null;

  return (
    <section className="mt-5" aria-label="Events for the selected date">
      <div className="mb-1 flex items-center justify-between border-b border-hairline pb-2.5">
        <h2 className="text-xs font-semibold text-ink">Schedule</h2>
        <span className="text-[10px] text-muted">{events.length} {events.length === 1 ? "event" : "events"}</span>
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
                  <span className="shrink-0 rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[9px] font-semibold text-muted">{getTypeLabel(event?.dashpointType)}</span>
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
