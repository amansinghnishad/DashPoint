export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CREATE_ITEM_TYPES = [
  { value: "event", label: "Event" },
  { value: "task", label: "Task" },
  { value: "todo", label: "To-do" },
];

export const CREATE_ITEM_COLORS = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
];

export const DASHPOINT_COLOR_TO_GOOGLE_COLOR_ID = {
  info: "9",
  success: "10",
  warning: "6",
  danger: "11",
};

export const DEFAULT_CREATE_START_TIME = "09:00";
export const DEFAULT_CREATE_END_TIME = "10:00";
export const DEFAULT_CREATE_COLOR = "info";
export const DEFAULT_CREATE_TYPE = "event";
