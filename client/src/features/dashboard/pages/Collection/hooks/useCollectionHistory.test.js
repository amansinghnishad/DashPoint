import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useCollectionHistory from "./useCollectionHistory";

describe("useCollectionHistory Hook", () => {
  const initialItems = { "card-1": { x: 100, y: 100, width: 200, height: 150 } };

  it("should initialize with canUndo=false and canRedo=false", () => {
    const { result } = renderHook(() => useCollectionHistory(initialItems));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("should track state changes and enable undo", () => {
    const { result } = renderHook(() => useCollectionHistory(initialItems));

    const updatedItems = { "card-1": { x: 250, y: 300, width: 200, height: 150 } };
    act(() => {
      result.current.recordSnapshot(updatedItems);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("should not duplicate identical state in history stack", () => {
    const { result } = renderHook(() => useCollectionHistory(initialItems));

    act(() => {
      result.current.recordSnapshot(initialItems);
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("should correctly undo and redo states", () => {
    const { result } = renderHook(() => useCollectionHistory(initialItems));

    const state2 = { "card-1": { x: 200, y: 200, width: 200, height: 150 } };
    act(() => {
      result.current.recordSnapshot(state2);
    });

    // Undo to initial
    let restoredState;
    act(() => {
      restoredState = result.current.undo();
    });

    expect(restoredState).toEqual(initialItems);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // Redo to state2
    let redoneState;
    act(() => {
      redoneState = result.current.redo();
    });

    expect(redoneState).toEqual(state2);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("should clear history properly", () => {
    const { result } = renderHook(() => useCollectionHistory(initialItems));

    act(() => {
      result.current.recordSnapshot({ "card-1": { x: 300, y: 300, width: 200, height: 150 } });
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.clearHistory(initialItems);
    });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
