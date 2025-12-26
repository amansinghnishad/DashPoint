import { useState } from "react";

export default function PlannerMealPlannerWidget() {
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snacks, setSnacks] = useState("");

  const inputClass =
    "dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none";

  return (
    <div className="space-y-2">
      <input
        value={breakfast}
        onChange={(e) => setBreakfast(e.target.value)}
        placeholder="Breakfast"
        className={inputClass}
      />
      <input
        value={lunch}
        onChange={(e) => setLunch(e.target.value)}
        placeholder="Lunch"
        className={inputClass}
      />
      <input
        value={dinner}
        onChange={(e) => setDinner(e.target.value)}
        placeholder="Dinner"
        className={inputClass}
      />
      <input
        value={snacks}
        onChange={(e) => setSnacks(e.target.value)}
        placeholder="Snacks"
        className={inputClass}
      />
    </div>
  );
}
