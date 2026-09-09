import { describe, expect, it } from "vitest";

import { compactParams, getResponseData } from "./httpUtils";

describe("httpUtils Unit Tests", () => {
  it("should extract response data from promise", async () => {
    const promise = Promise.resolve({ data: { message: "success" } });
    const result = await getResponseData(promise);
    expect(result).toEqual({ message: "success" });
  });

  it("should compact params by stripping null, undefined, and empty strings", () => {
    const raw = {
      page: 1,
      search: "",
      filter: null,
      sort: undefined,
      tag: "react",
    };

    const compacted = compactParams(raw);
    expect(compacted).toEqual({ page: 1, tag: "react" });
  });
});
