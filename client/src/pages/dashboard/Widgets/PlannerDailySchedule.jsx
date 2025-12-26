import { useState } from "react";

const newSlot = () => ({ time: "", text: "" });

export default function PlannerDailyScheduleWidget() {
  const [slots, setSlots] = useState(() => [
    { time: "08:00", text: "" },
    { time: "10:00", text: "" },
    { time: "12:00", text: "" },
    { time: "14:00", text: "" },
    { time: "16:00", text: "" },
    { time: "18:00", text: "" },
  ]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2">
            <input
              value={slot.time}
              onChange={(e) => {
                const next = [...slots];
                next[idx] = { ...next[idx], time: e.target.value };
                setSlots(next);
              }}
              placeholder="Time"
              className="dp-surface dp-border dp-text col-span-4 rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              value={slot.text}
              onChange={(e) => {
                const next = [...slots];
                next[idx] = { ...next[idx], text: e.target.value };
                setSlots(next);
              }}
              placeholder="Plan…"
              className="dp-surface dp-border dp-text col-span-8 rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setSlots((prev) => [...prev, newSlot()])}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add time
        </button>
      </div>
    </div>
  );
}
