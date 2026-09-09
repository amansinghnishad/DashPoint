import { describe, expect, it } from "vitest";

import {
  getDefaultPlannerWidgetData,
  getPlannerWidgetLabel,
  PLANNER_WIDGET_MENU_OPTIONS,
} from "./plannerWidgetDefaults";

describe("plannerWidgetDefaults Unit Tests", () => {
  it("should return labels for widget types", () => {
    expect(getPlannerWidgetLabel("todo-list")).toBe("To do list");
    expect(getPlannerWidgetLabel("appointments")).toBe("Appointments");
    expect(getPlannerWidgetLabel("daily-schedule")).toBe("Daily schedule");
    expect(getPlannerWidgetLabel("notes")).toBe("Notes");
    expect(getPlannerWidgetLabel("unknown")).toBe("Planner");
  });

  it("should return default payload structures for each widget type", () => {
    expect(getDefaultPlannerWidgetData("todo-list")).toEqual({ items: [] });
    expect(getDefaultPlannerWidgetData("appointments")).toEqual({ items: [] });
    expect(getDefaultPlannerWidgetData("daily-schedule")).toEqual({ blocks: [] });
    expect(getDefaultPlannerWidgetData("notes")).toEqual({ text: "" });
    expect(getDefaultPlannerWidgetData("notes-tomorrow")).toEqual({ text: "" });
    expect(getDefaultPlannerWidgetData("custom")).toEqual({});
  });

  it("should export menu options", () => {
    expect(PLANNER_WIDGET_MENU_OPTIONS).toHaveLength(4);
  });
});
