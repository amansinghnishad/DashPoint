import { dayKey, parseEventStartDate } from "./dateUtils";

export const getEventChipClassByType = (type) => {
  if (type === "todo") return "dp-cal-chip dp-cal-chip-todo";
  if (type === "task") return "dp-cal-chip dp-cal-chip-task";
  return "dp-cal-chip dp-cal-chip-event";
};

export const getEventChipClassByColor = (color) => {
  if (color === "success") return "dp-cal-chip dp-cal-chip-success";
  if (color === "warning") return "dp-cal-chip dp-cal-chip-warning";
  if (color === "danger") return "dp-cal-chip dp-cal-chip-danger";
  if (color === "info") return "dp-cal-chip dp-cal-chip-info";
  return null;
};

export const getEventChipClass = (event) =>
  getEventChipClassByColor(event?.dashpointColor) ||
  getEventChipClassByType(event?.dashpointType);

export const groupEventsByDay = (events = []) => {
  const eventsByDay = new Map();

  for (const event of events) {
    const start = parseEventStartDate(event?.start);
    if (!start) continue;

    const key = dayKey(start);
    const current = eventsByDay.get(key) || [];
    current.push(event);
    eventsByDay.set(key, current);
  }

  for (const [key, list] of eventsByDay.entries()) {
    list.sort((left, right) => {
      const leftStart = parseEventStartDate(left?.start);
      const rightStart = parseEventStartDate(right?.start);
      return (leftStart?.getTime?.() || 0) - (rightStart?.getTime?.() || 0);
    });
    eventsByDay.set(key, list);
  }

  return eventsByDay;
};
