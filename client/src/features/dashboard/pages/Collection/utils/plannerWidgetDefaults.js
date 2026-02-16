export const PLANNER_WIDGET_MENU_OPTIONS = [
  { value: "todo-list", label: "To do list" },
  { value: "appointments", label: "Appointments" },
  { value: "daily-schedule", label: "Daily schedule" },
  { value: "notes", label: "Notes" },
];

export const getPlannerWidgetLabel = (widgetType) => {
  const found = PLANNER_WIDGET_MENU_OPTIONS.find((o) => o.value === widgetType);
  return found?.label || "Planner";
};

export const getDefaultPlannerWidgetData = (widgetType) => {
  switch (widgetType) {
    case "todo-list":
      return { items: [] };
    case "appointments":
      return { items: [] };
    case "daily-schedule":
      return { blocks: [] };
    case "notes":
      return { text: "" };
    case "notes-tomorrow":
      return { text: "" };
    default:
      return {};
  }
};
