import { CalendarClock, Clock } from "@/shared/ui/icons/icons";

import { formatEventTimeLabel, getEventChipClass } from "../utils/eventUtils";

const formatSelectedDay = (value) =>
  value.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getTypeLabel = (type) => {
  if (type === "todo") return "To-do";
  if (type === "task") return "Task";
  return "Event";
};

export default function CalendarAgendaPanel({
  connected,
  selectedDate,
  selectedDayEvents,
  onOpenCreate,
}) {
  const events = Array.isArray(selectedDayEvents) ? selectedDayEvents : [];

  return (
    <aside className="dp-surface dp-border rounded-2xl border p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="dp-text text-sm font-semibold">Agenda</p>
          <p className="dp-text-muted mt-1 text-xs truncate">{formatSelectedDay(selectedDate)}</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="dp-btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
        >
          Add
        </button>
      </div>

      <div className="mt-4">
        {!connected ? (
          <div className="dp-surface-muted dp-border rounded-xl border p-3">
            <p className="dp-text text-sm font-semibold">Google Calendar not connected</p>
            <p className="dp-text-muted mt-1 text-xs">
              Connect your calendar to view and schedule events from this panel.
            </p>
          </div>
        ) : !events.length ? (
          <div className="dp-surface-muted dp-border rounded-xl border p-4 text-center">
            <CalendarClock size={18} className="mx-auto dp-text-muted" />
            <p className="dp-text mt-2 text-sm font-semibold">No events scheduled</p>
            <p className="dp-text-muted mt-1 text-xs">
              This day is clear. Add an event or focus block.
            </p>
          </div>
        ) : (
          <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {events.map((event) => {
              const timeLabel = formatEventTimeLabel(event);
              const typeLabel = getTypeLabel(event?.dashpointType);

              return (
                <div
                  key={event.id}
                  className={
                    "dp-border dp-surface-muted rounded-xl border p-3 transition-colors " +
                    "motion-safe:duration-200 motion-safe:ease-out hover:dp-surface " +
                    getEventChipClass(event)
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="dp-text text-sm font-semibold truncate">
                      {event?.summary || "(No title)"}
                    </p>
                    <span className="dp-text-subtle text-[11px] font-semibold">{typeLabel}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <Clock size={13} className="dp-text-muted" />
                    <p className="dp-text-muted text-xs">{timeLabel || "Time unavailable"}</p>
                  </div>

                  {event?.description ? (
                    <p className="dp-text-muted mt-2 line-clamp-2 text-xs">{event.description}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
