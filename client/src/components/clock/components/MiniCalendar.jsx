import { generateCalendarDays } from "../utils/clockHelpers";

export const MiniCalendar = () => {
  const calendarDays = generateCalendarDays();

  return (
    <div className="mt-6 pt-4 border-t border-white/20">
      <div className="grid grid-cols-7 gap-1 text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center font-medium opacity-75 p-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs mt-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`text-center p-1 rounded ${
              day.isToday
                ? "bg-white text-indigo-600 font-bold"
                : day.isCurrentMonth
                ? "text-white"
                : "text-white/40"
            }`}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );
};
