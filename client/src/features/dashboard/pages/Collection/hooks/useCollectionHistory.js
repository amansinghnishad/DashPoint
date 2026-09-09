import { useCallback, useRef, useState } from "react";

const MAX_HISTORY_LENGTH = 30;

function deepClone(obj) {
  if (!obj) return {};
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { ...obj };
  }
}

function areLayoutsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    const itemA = a[key];
    const itemB = b[key];
    if (!itemA || !itemB) return false;
    return (
      itemA.x === itemB.x &&
      itemA.y === itemB.y &&
      itemA.width === itemB.width &&
      itemA.height === itemB.height
    );
  });
}

export default function useCollectionHistory(initialState = {}) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pastRef = useRef([]);
  const presentRef = useRef(deepClone(initialState));
  const futureRef = useRef([]);
  const isUndoRedoActionRef = useRef(false);

  const updateFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const recordSnapshot = useCallback(
    (nextState) => {
      if (isUndoRedoActionRef.current) {
        isUndoRedoActionRef.current = false;
        return;
      }

      if (!nextState || typeof nextState !== "object") return;
      if (areLayoutsEqual(presentRef.current, nextState)) return;

      pastRef.current = [...pastRef.current.slice(-MAX_HISTORY_LENGTH + 1), deepClone(presentRef.current)];
      presentRef.current = deepClone(nextState);
      futureRef.current = [];
      updateFlags();
    },
    [updateFlags],
  );

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return null;

    const previous = pastRef.current[pastRef.current.length - 1];
    const newPast = pastRef.current.slice(0, -1);

    futureRef.current = [deepClone(presentRef.current), ...futureRef.current.slice(0, MAX_HISTORY_LENGTH - 1)];
    presentRef.current = deepClone(previous);
    pastRef.current = newPast;

    isUndoRedoActionRef.current = true;
    updateFlags();
    return presentRef.current;
  }, [updateFlags]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return null;

    const next = futureRef.current[0];
    const newFuture = futureRef.current.slice(1);

    pastRef.current = [...pastRef.current.slice(-MAX_HISTORY_LENGTH + 1), deepClone(presentRef.current)];
    presentRef.current = deepClone(next);
    futureRef.current = newFuture;

    isUndoRedoActionRef.current = true;
    updateFlags();
    return presentRef.current;
  }, [updateFlags]);

  const clearHistory = useCallback((newState = {}) => {
    pastRef.current = [];
    presentRef.current = deepClone(newState);
    futureRef.current = [];
    isUndoRedoActionRef.current = false;
    updateFlags();
  }, [updateFlags]);

  return {
    recordSnapshot,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
  };
}
