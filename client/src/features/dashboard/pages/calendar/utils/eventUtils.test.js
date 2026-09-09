import { describe, expect, it } from "vitest";

import {
  formatEventTimeLabel,
  getEventChipClass,
  getEventChipClassByColor,
  getEventChipClassByType,
  groupEventsByDay,
} from "./eventUtils";

describe("eventUtils Unit Tests", () => {
  it("should get chip class by event type and color", () => {
    expect(getEventChipClassByType("todo")).toContain("dp-cal-chip-todo");
    expect(getEventChipClassByType("task")).toContain("dp-cal-chip-task");
    expect(getEventChipClassByType("event")).toContain("dp-cal-chip-event");

    expect(getEventChipClassByColor("success")).toContain("dp-cal-chip-success");
    expect(getEventChipClassByColor("warning")).toContain("dp-cal-chip-warning");
    expect(getEventChipClassByColor("danger")).toContain("dp-cal-chip-danger");
    expect(getEventChipClassByColor("unknown")).toBeNull();

    expect(getEventChipClass({ dashpointColor: "success" })).toContain("dp-cal-chip-success");
    expect(getEventChipClass({ dashpointType: "todo" })).toContain("dp-cal-chip-todo");
  });

  it("should format event time labels for all-day and timed events", () => {
    const allDayEvent = { allDay: true };
    expect(formatEventTimeLabel(allDayEvent)).toBe("All day");

    const timedEvent = { start: { dateTime: "2026-08-25T14:30:00.000Z" } };
    expect(formatEventTimeLabel(timedEvent)).toBeTruthy();
  });

  it("should group and sort events by day", () => {
    const events = [
      { id: "e1", start: { dateTime: "2026-08-25T15:00:00.000Z" } },
      { id: "e2", start: { dateTime: "2026-08-25T10:00:00.000Z" } },
      { id: "e3", start: { dateTime: "2026-08-26T09:00:00.000Z" } },
    ];

    const grouped = groupEventsByDay(events);
    expect(grouped.size).toBe(2);
  });
});
