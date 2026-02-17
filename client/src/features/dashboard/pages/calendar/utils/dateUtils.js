export const startOfMonth = (value) =>
  new Date(value.getFullYear(), value.getMonth(), 1);

export const endOfMonth = (value) =>
  new Date(value.getFullYear(), value.getMonth() + 1, 0);

export const startOfDay = (value) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);

export const endOfDay = (value) =>
  new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999
  );

export const isSameDay = (left, right) =>
  left && right
    ? left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    : false;

export const formatMonthLabel = (value) =>
  value.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const pad2 = (value) => String(value).padStart(2, "0");

export const dayKey = (value) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getEventStartValue = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.dateTime || value.date || null;
  }
  return String(value);
};

export const parseEventStartDate = (eventStart) => {
  const raw = getEventStartValue(eventStart);
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map((item) => parseInt(item, 10));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const buildMonthGrid = (month) => {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startWeekday = first.getDay();
  const totalDays = last.getDate();

  const grid = [];

  for (let index = 0; index < startWeekday; index += 1) {
    const previousMonthDate = new Date(first);
    previousMonthDate.setDate(first.getDate() - (startWeekday - index));
    grid.push(previousMonthDate);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    grid.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (grid.length % 7 !== 0) {
    const nextMonthDate = new Date(last);
    nextMonthDate.setDate(last.getDate() + (grid.length - (startWeekday + totalDays) + 1));
    grid.push(nextMonthDate);
  }

  while (grid.length < 42) {
    const lastCell = grid[grid.length - 1];
    const nextDay = new Date(lastCell);
    nextDay.setDate(lastCell.getDate() + 1);
    grid.push(nextDay);
  }

  return grid;
};

export const createMonthIsoRange = (month) => {
  const monthStart = startOfDay(startOfMonth(month));
  const monthEnd = endOfDay(endOfMonth(month));
  return { timeMin: monthStart.toISOString(), timeMax: monthEnd.toISOString() };
};
