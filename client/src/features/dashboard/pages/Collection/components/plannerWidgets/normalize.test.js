import { describe, expect, it } from "vitest";

import {
  normalizeAppointmentsData,
  normalizeDailyScheduleData,
  normalizeNotesData,
  normalizeTodoListData,
} from "./normalize";

describe("plannerWidgets normalize Unit Tests", () => {
  it("should normalize todo list items", () => {
    const raw = { items: [{ done: true, text: "Buy groceries" }, { done: false, text: null }] };
    const normalized = normalizeTodoListData(raw);
    expect(normalized.items).toEqual([
      { done: true, text: "Buy groceries" },
      { done: false, text: "" },
    ]);
  });

  it("should normalize appointments items", () => {
    const raw = { items: [{ title: "Doctor", when: "10:00 AM" }] };
    const normalized = normalizeAppointmentsData(raw);
    expect(normalized.items).toEqual([{ title: "Doctor", when: "10:00 AM" }]);
  });

  it("should normalize daily schedule blocks", () => {
    const raw = { blocks: [{ start: "09:00", end: "10:00", title: "Standup" }] };
    const normalized = normalizeDailyScheduleData(raw);
    expect(normalized.blocks).toEqual([{ start: "09:00", end: "10:00", title: "Standup" }]);
  });

  it("should normalize notes text", () => {
    expect(normalizeNotesData({ text: "Hello note" })).toEqual({ text: "Hello note" });
    expect(normalizeNotesData(null)).toEqual({ text: "" });
  });
});
