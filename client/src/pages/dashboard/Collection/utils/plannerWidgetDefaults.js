export const PLANNER_WIDGET_MENU_OPTIONS = [
  { value: "top-priorities", label: "Top Priorities" },
  { value: "todo-list", label: "To do list" },
  { value: "appointments", label: "Appointments" },
  { value: "daily-schedule", label: "Daily schedule" },
  { value: "goals", label: "Goals" },
  { value: "meal-planner", label: "Meal planner" },
  { value: "water-tracker", label: "Water tracker" },
  { value: "calls-emails", label: "Calls / emails" },
  { value: "expense-tracker", label: "Expense tracker" },
  { value: "notes-tomorrow", label: "Notes" },
  { value: "rate-your-day", label: "Rate your day" },
];

export const getPlannerWidgetLabel = (widgetType) => {
  const found = PLANNER_WIDGET_MENU_OPTIONS.find((o) => o.value === widgetType);
  return found?.label || "Planner";
};

export const getDefaultPlannerWidgetData = (widgetType) => {
  switch (widgetType) {
    case "top-priorities":
      return { items: [] };
    case "todo-list":
      return { items: [] };
    case "appointments":
      return { items: [] };
    case "daily-schedule":
      return { blocks: [] };
    case "goals":
      return { goals: [] };
    case "notes":
      return { text: "" };
    case "meal-planner":
      return { items: [] };
    case "water-tracker":
      return { count: 0 };
    case "calls-emails":
      return { items: [] };
    case "expense-tracker":
      return { rows: [] };
    case "notes-tomorrow":
      return { text: "" };
    case "rate-your-day":
      return { rating: 0, note: "" };
    default:
      return {};
  }
};
