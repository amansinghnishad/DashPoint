import { useEffect, useMemo, useRef } from "react";

import { ChevronLeft, ChevronRight } from "@/shared/ui/icons/icons";

import { dayKey, isSameDay } from "../utils/dateUtils";

const getMonthWeeks = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const dayCount = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const weekCount = Math.ceil((offset + dayCount) / 7);
  const firstVisibleDate = new Date(year, month, 1 - offset);

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(firstVisibleDate);
      date.setDate(firstVisibleDate.getDate() + weekIndex * 7 + dayIndex);
      return date;
    }),
  );
};

export default function CalendarMonthGrid({
  selectedDate,
  today,
  eventsByDay,
  onSelectDate,
}) {
  const weeks = useMemo(() => getMonthWeeks(selectedDate), [selectedDate]);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const firstDayOffset = (new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() + 6) % 7;
    const weekIndex = Math.floor((selectedDate.getDate() + firstDayOffset - 1) / 7);
    scroller.scrollTo({ left: weekIndex * scroller.clientWidth, behavior: "smooth" });
  }, [selectedDate, weeks.length]);

  const scrollDates = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * scroller.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-y border-hairline py-3" aria-label="Choose a day">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollDates(-1)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-card text-muted transition hover:bg-canvas-soft hover:text-ink"
          aria-label="Scroll to earlier dates"
          title="Scroll to earlier dates"
        >
          <ChevronLeft size={15} />
        </button>

        <div
          ref={scrollerRef}
          className="scrollbar-thin flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1"
          role="group"
          aria-label="Weeks in this month. Scroll one week at a time."
        >
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid w-full shrink-0 snap-start grid-cols-7 gap-2">
              {week.map((date) => {
                const selected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const isInCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const eventCount = eventsByDay.get(dayKey(date))?.length ?? 0;

                return (
                  <button
                    key={dayKey(date)}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    aria-pressed={selected}
                    aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}${eventCount ? `, ${eventCount} ${eventCount === 1 ? "item" : "items"}` : ""}`}
                    className={`group flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-0.5 py-1 transition hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isInCurrentMonth ? "text-ink" : "text-muted/60"}`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className={`grid h-8 w-8 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-all sm:h-10 sm:w-10 ${
                      selected
                        ? "border-ink bg-ink text-canvas shadow-md shadow-ink/10"
                        : isToday
                          ? "border-ink/30 bg-surface-card text-ink group-hover:border-ink/60"
                          : "border-transparent bg-transparent text-ink group-hover:border-hairline"
                    }`}>{date.getDate()}</span>
                    <span className="flex h-1 items-center gap-0.5" aria-hidden="true">
                      {Array.from({ length: Math.min(eventCount, 3) }, (_, index) => (
                        <span key={index} className={`h-1 w-1 rounded-full ${selected ? "bg-ink" : "bg-primary"}`} />
                      ))}
                      {isToday && !selected && eventCount === 0 ? <span className="h-1 w-1 rounded-full bg-ink/50" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollDates(1)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-card text-muted transition hover:bg-canvas-soft hover:text-ink"
          aria-label="Scroll to later dates"
          title="Scroll to later dates"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}
