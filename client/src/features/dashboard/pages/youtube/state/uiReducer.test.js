import { describe, expect, it } from "vitest";

import { UI_INITIAL_STATE, uiReducer } from "./uiReducer";

describe("uiReducer Unit Tests", () => {
  it("should handle SET_LOADING and SET_ADDING", () => {
    let state = uiReducer(UI_INITIAL_STATE, { type: "SET_LOADING", payload: true });
    expect(state.isLoading).toBe(true);

    state = uiReducer(state, { type: "SET_ADDING", payload: true });
    expect(state.isAdding).toBe(true);
  });

  it("should handle SET_URL and RESET_ADD_FORM", () => {
    let state = uiReducer(UI_INITIAL_STATE, { type: "SET_URL", payload: "https://youtu.be/123" });
    expect(state.urlInput).toBe("https://youtu.be/123");

    state = uiReducer(state, { type: "RESET_ADD_FORM" });
    expect(state.urlInput).toBe("");
    expect(state.isAdding).toBe(false);
  });

  it("should handle collection and delete modal toggles", () => {
    let state = uiReducer(UI_INITIAL_STATE, { type: "OPEN_ADD_COLLECTION", payload: { id: "y1" } });
    expect(state.addToCollectionItem).toEqual({ id: "y1" });

    state = uiReducer(state, { type: "CLOSE_ADD_COLLECTION" });
    expect(state.addToCollectionItem).toBeNull();

    state = uiReducer(state, { type: "OPEN_DELETE", payload: { id: "y1" } });
    expect(state.deleteItem).toEqual({ id: "y1" });

    state = uiReducer(state, { type: "CLOSE_DELETE" });
    expect(state.deleteItem).toBeNull();
  });
});
