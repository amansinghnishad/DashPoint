import { useEffect, useRef } from "react";

import { COLLECTION_SHORTCUT_GROUPS } from "../pages/Collection/hooks/useCollectionKeyboardShortcuts";

const SEQUENCE_TIMEOUT_MS = 1200;

const isEditableTarget = (target) => {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

const hasShortcutModifier = (event) => event.ctrlKey || event.metaKey;

const clearSequenceTimer = (timerRef) => {
  if (!timerRef.current) return;
  window.clearTimeout(timerRef.current);
  timerRef.current = null;
};

export const DASHBOARD_SHORTCUT_GROUPS = [
  {
    title: "Dashboard",
    items: [
      { keys: ["?"], description: "Open keyboard shortcuts" },
      { keys: ["Ctrl/Cmd", "B"], description: "Toggle the sidebar" },
      { keys: ["Ctrl/Cmd", "/"], description: "Focus the AI chat" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { keys: ["G", "H"], description: "Go to Home" },
      { keys: ["G", "C"], description: "Go to Calendar" },
      { keys: ["G", "Y"], description: "Go to YouTube" },
      { keys: ["G", "F"], description: "Go to File Manager" },
    ],
  },
  {
    title: "Collection canvas",
    items: [
      { keys: ["Space", "Drag"], description: "Pan around a collection" },
      { keys: ["Ctrl/Cmd", "Wheel"], description: "Zoom the canvas" },
      { keys: ["Middle mouse", "Drag"], description: "Pan without holding Space" },
    ],
  },
  ...COLLECTION_SHORTCUT_GROUPS,
];

export default function useDashboardKeyboardShortcuts({
  disabled = false,
  onNavigate,
  onOpenShortcuts,
  onToggleSidebar,
}) {
  const sequenceRef = useRef(null);
  const sequenceTimerRef = useRef(null);

  useEffect(() => {
    if (disabled) return undefined;

    const resetSequence = () => {
      sequenceRef.current = null;
      clearSequenceTimer(sequenceTimerRef);
    };

    const startSequence = (value) => {
      sequenceRef.current = value;
      clearSequenceTimer(sequenceTimerRef);
      sequenceTimerRef.current = window.setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);
    };

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.repeat) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        resetSequence();
        onOpenShortcuts?.();
        return;
      }

      if (hasShortcutModifier(event) && key === "b" && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        resetSequence();
        onToggleSidebar?.();
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        resetSequence();
        return;
      }

      if (sequenceRef.current === "g") {
        const nextTabByKey = {
          h: "collections",
          c: "calendar",
          y: "youtube",
          f: "files",
        };

        const nextTab = nextTabByKey[key];
        resetSequence();

        if (nextTab) {
          event.preventDefault();
          onNavigate?.(nextTab);
        }

        return;
      }

      if (key === "g") {
        event.preventDefault();
        startSequence("g");
        return;
      }

      resetSequence();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      resetSequence();
    };
  }, [disabled, onNavigate, onOpenShortcuts, onToggleSidebar]);
}
