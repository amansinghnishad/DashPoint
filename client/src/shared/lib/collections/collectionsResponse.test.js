import { describe, expect, it } from "vitest";

import {
  getCollectionPickerOptions,
  getCollectionsFromResponse,
  getCollectionsPayload,
} from "./collectionsResponse";

describe("collectionsResponse Unit Tests", () => {
  it("should extract collections list from nested response", () => {
    const raw = {
      data: {
        collections: [{ _id: "c1", name: "AI Papers" }],
        pagination: { total: 1 },
      },
    };

    const collections = getCollectionsFromResponse(raw);
    expect(collections).toHaveLength(1);
    expect(collections[0].name).toBe("AI Papers");
  });

  it("should extract picker options correctly", () => {
    const raw = {
      data: {
        collections: [
          { _id: "c1", name: "AI Papers" },
          { id: "c2", name: "Work Tasks" },
        ],
      },
    };

    const options = getCollectionPickerOptions(raw);
    expect(options).toEqual([
      { id: "c1", name: "AI Papers" },
      { id: "c2", name: "Work Tasks" },
    ]);
  });

  it("should calculate payload with total fallback", () => {
    const raw = {
      data: {
        collections: [{ _id: "c1" }, { _id: "c2" }],
      },
    };

    const payload = getCollectionsPayload(raw);
    expect(payload.total).toBe(2);
  });
});
