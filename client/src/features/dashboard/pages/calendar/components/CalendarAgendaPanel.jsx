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
    <aside className="bg-surface-card border border-hairline rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-hairline/60 pb-3 select-none">
        <div className="min-w-0">
          <p className="font-waldenburg-light text-lg font-bold text-ink leading-tight">Agenda</p>
          <p className="text-muted text-xs font-medium mt-1 truncate">{formatSelectedDay(selectedDate)}</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary-active text-canvas rounded-full px-4 py-1.5 text-xs font-semibold transition-all h-8 flex items-center justify-center shadow-sm"
        >
          Add
        </button>
      </div>

      <div className="mt-4">
        {!connected ? (
          <div className="border border-hairline bg-canvas-soft/40 rounded-xl p-4 text-center">
            <CalendarClock size={20} className="mx-auto text-muted-soft mb-2" />
            <p className="text-ink text-sm font-semibold">Google Calendar disconnected</p>
            <p className="text-muted mt-1 text-xs leading-normal">
              Connect your calendar to view and schedule events from this panel.
            </p>
          </div>
        ) : !events.length ? (
          <div className="border border-hairline bg-canvas-soft/40 rounded-xl p-6 text-center">
            <CalendarClock size={20} className="mx-auto text-muted-soft mb-2" />
            <p className="text-ink text-sm font-semibold">No events scheduled</p>
            <p className="text-muted mt-1 text-xs leading-normal">
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
                    "border border-hairline/60 bg-canvas-soft/40 rounded-xl p-3.5 transition-colors " +
                    "duration-200 ease-out hover:bg-canvas-soft " +
                    getEventChipClass(event)
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ink text-sm font-bold truncate">
                      {event?.summary || "(No title)"}
                    </p>
                    <span className="text-muted text-[10px] font-bold uppercase tracking-wider bg-canvas px-2 py-0.5 rounded-full">{typeLabel}</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 select-none">
                    <Clock size={13} className="text-muted" />
                    <p className="text-muted-soft text-xs font-semibold">{timeLabel || "All day"}</p>
                  </div>

                  {event?.description ? (
                    <p className="text-muted mt-2 line-clamp-2 text-xs leading-normal">{event.description}</p>
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
