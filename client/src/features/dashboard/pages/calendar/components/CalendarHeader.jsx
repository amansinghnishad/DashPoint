import { ChevronLeft, ChevronRight } from "@/shared/ui/icons";

export default function CalendarHeader({
  monthLabel,
  onGoToToday,
  onGoToPreviousMonth,
  onGoToNextMonth,
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="dp-text text-xl font-semibold truncate">Calendar</h1>
        <p className="dp-text-muted mt-1 text-sm truncate">{monthLabel}</p>
      </div>

      <div className="flex items-center gap-2">
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
  );
}
