import { useState } from "react";

const newRow = () => ({ time: "", text: "" });

export default function PlannerAppointmentsWidget() {
  const [rows, setRows] = useState(() => [newRow(), newRow()]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2">
            <input
              value={row.time}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], time: e.target.value };
                setRows(next);
              }}
              placeholder="Time"
              className="dp-surface dp-border dp-text col-span-4 rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <input
              value={row.text}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...next[idx], text: e.target.value };
                setRows(next);
              }}
              placeholder="Appointment"
              className="dp-surface dp-border dp-text col-span-8 rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, newRow()])}
          className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Add row
        </button>
      </div>
    </div>
  );
}
