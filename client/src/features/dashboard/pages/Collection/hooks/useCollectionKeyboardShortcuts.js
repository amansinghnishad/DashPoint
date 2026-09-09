import { useEffect } from "react";

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

const stopShortcutEvent = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

export const COLLECTION_SHORTCUT_GROUPS = [
  {
    title: "Collection flow",
    items: [
      { keys: ["Esc"], description: "Close the current panel or go back" },
      { keys: ["0"], description: "Re-center the canvas" },
      { keys: ["⌘", "Z"], description: "Undo layout changes" },
      { keys: ["⌘", "Shift", "Z"], description: "Redo layout changes" },
    ],
  },
  {
    title: "Create in collection",
    items: [
      { keys: ["1"], description: "Create a to do list" },
      { keys: ["2"], description: "Create appointments" },
      { keys: ["3"], description: "Create a daily schedule" },
      { keys: ["4"], description: "Create notes" },
      { keys: ["5"], description: "Add a photo" },
      { keys: ["6"], description: "Add a YouTube item" },
      { keys: ["7"], description: "Add a file" },
      { keys: ["8"], description: "Voice dictation note" },
    ],
  },
];

export default function useCollectionKeyboardShortcuts({
  creatingPlanner = false,
  deleteBusy = false,
  deleteOpen = false,
  documentSummaryBusy = false,
  documentSummaryOpen = false,
  voiceNoteOpen = false,
  exportImportOpen = false,
  pickerOpen = false,
  onBack,
  onCloseDelete,
  onCloseDocumentSummary,
  onCloseVoiceNote,
  onCloseExportImport,
  onClosePicker,
  onCreatePlanner,
  onRecenterViewport,
  onSelectTool,
  onUndo,
  onRedo,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.repeat) return;

      if (event.key === "Escape") {
        stopShortcutEvent(event);

        if (deleteOpen) {
          if (!deleteBusy) onCloseDelete?.();
          return;
        }

        if (documentSummaryOpen) {
          if (!documentSummaryBusy) onCloseDocumentSummary?.();
          return;
        }

        if (voiceNoteOpen) {
          onCloseVoiceNote?.();
          return;
        }

        if (exportImportOpen) {
          onCloseExportImport?.();
          return;
        }

        if (pickerOpen) {
          onClosePicker?.();
          return;
        }

        onBack?.();
        return;
      }

      if (
        pickerOpen ||
        documentSummaryOpen ||
        deleteOpen ||
        voiceNoteOpen ||
        exportImportOpen
      ) {
        return;
      }

      if (isEditableTarget(event.target)) return;

      // Handle Undo (⌘Z / Ctrl+Z) and Redo (⌘⇧Z / Ctrl+Shift+Z / Ctrl+Y)
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (isCmdOrCtrl && !event.altKey) {
        const key = event.key?.toLowerCase();
        if (key === "z") {
          stopShortcutEvent(event);
          if (event.shiftKey) {
            onRedo?.();
          } else {
            onUndo?.();
          }
          return;
        }
        if (key === "y") {
          stopShortcutEvent(event);
          onRedo?.();
          return;
        }
      }

      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const plannerTypeByKey = {
        1: "todo-list",
        2: "appointments",
        3: "daily-schedule",
        4: "notes",
      };

      const toolByKey = {
        5: "photo",
        6: "youtube",
        7: "file",
        8: "voice",
      };

      const plannerType = plannerTypeByKey[event.key];
      if (plannerType) {
        stopShortcutEvent(event);
        if (!creatingPlanner) onCreatePlanner?.(plannerType);
        return;
      }

      const tool = toolByKey[event.key];
      if (tool) {
        stopShortcutEvent(event);
        onSelectTool?.(tool);
        return;
      }

      if (event.key === "0") {
        stopShortcutEvent(event);
        onRecenterViewport?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    creatingPlanner,
    deleteBusy,
    deleteOpen,
    documentSummaryBusy,
    documentSummaryOpen,
    exportImportOpen,
    onBack,
    onCloseDelete,
    onCloseDocumentSummary,
    onCloseExportImport,
    onClosePicker,
    onCloseVoiceNote,
    onCreatePlanner,
    onRecenterViewport,
    onRedo,
    onSelectTool,
    onUndo,
    pickerOpen,
    voiceNoteOpen,
  ]);
}
