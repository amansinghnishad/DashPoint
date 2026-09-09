import { describe, expect, it } from "vitest";

import { SEARCH_INITIAL_STATE, searchReducer } from "./searchReducer";

describe("searchReducer Unit Tests", () => {
  it("should handle SET_QUERY", () => {
    const next = searchReducer(SEARCH_INITIAL_STATE, { type: "SET_QUERY", payload: "React 19" });
    expect(next.query).toBe("React 19");
  });

  it("should handle START", () => {
    const next = searchReducer(SEARCH_INITIAL_STATE, { type: "START" });
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it("should handle SUCCESS", () => {
    const results = [{ id: "v1", title: "Video 1" }];
    const next = searchReducer(SEARCH_INITIAL_STATE, { type: "SUCCESS", payload: results });
    expect(next.results).toEqual(results);
    expect(next.isLoading).toBe(false);
  });

  it("should handle FAIL", () => {
    const next = searchReducer(SEARCH_INITIAL_STATE, { type: "FAIL", payload: "Network Error" });
    expect(next.error).toBe("Network Error");
    expect(next.isLoading).toBe(false);
  });

  it("should handle RESET", () => {
    const state = { query: "React", results: [{ id: "1" }], isLoading: true, error: "err" };
    const next = searchReducer(state, { type: "RESET" });
    expect(next.results).toEqual([]);
    expect(next.isLoading).toBe(false);
    expect(next.error).toBeNull();
  });
});
