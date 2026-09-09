import { describe, expect, it } from "vitest";

import {
  getPickerCollectionItemType,
  getPickerItemId,
  getPickerItemLabel,
  toSingleLine,
} from "./collectionPickerUtils";

describe("collectionPickerUtils Unit Tests", () => {
  it("should map tools to collection item types", () => {
    expect(getPickerCollectionItemType("youtube")).toBe("youtube");
    expect(getPickerCollectionItemType("file")).toBe("file");
    expect(getPickerCollectionItemType("photo")).toBe("file");
    expect(getPickerCollectionItemType("planner")).toBe("planner");
    expect(getPickerCollectionItemType("unknown")).toBeNull();
  });

  it("should resolve item id from _id or id", () => {
    expect(getPickerItemId({ _id: "mongo-id" })).toBe("mongo-id");
    expect(getPickerItemId({ id: "client-id" })).toBe("client-id");
    expect(getPickerItemId(null)).toBeNull();
  });

  it("should extract formatted labels for YouTube, planner, and file items", () => {
    const yt = getPickerItemLabel("youtube", { title: "React Tutorial", channelTitle: "Fireship" });
    expect(yt).toEqual({ title: "React Tutorial", subtitle: "Fireship" });

    const planner = getPickerItemLabel("planner", { title: "Sprint Tasks", widgetType: "todo-list" });
    expect(planner).toEqual({ title: "Sprint Tasks", subtitle: "To do list" });

    const file = getPickerItemLabel("file", { originalName: "spec.pdf", formattedSize: "1.2 MB" });
    expect(file).toEqual({ title: "spec.pdf", subtitle: "1.2 MB" });
  });

  it("should normalize multi-line strings into a single line", () => {
    const raw = "Line 1\n  Line 2\r\nLine 3";
    expect(toSingleLine(raw)).toBe("Line 1 Line 2 Line 3");
  });
});
