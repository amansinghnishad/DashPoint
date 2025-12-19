/**
 * Utility functions for sticky notes drag and drop functionality
 */

/**
 * Check if the drag event should be ignored (clicking on interactive elements)
 */
export const shouldIgnoreDrag = (e) => {
  return (
    e.target.tagName === "BUTTON" ||
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA"
  );
};

/**
 * Calculate drag offset from mouse position
 */
export const calculateDragOffset = (e, element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

/**
 * Calculate new position during drag, with bounds checking
 */
export const calculateNewPosition = (e, containerRect, dragOffset, noteSize = { width: 256, height: 192 }) => {
  if (!containerRect) return { x: 0, y: 0 };

  return {
    x: Math.max(
      0,
      Math.min(
        e.clientX - containerRect.left - dragOffset.x,
        containerRect.width - noteSize.width
      )
    ),
    y: Math.max(
      0,
      Math.min(
        e.clientY - containerRect.top - dragOffset.y,
        containerRect.height - noteSize.height
      )
    ),
  };
};

/**
 * Create a new sticky note with default values
 */
export const createNewNote = () => {
  return {
    title: "New Note",
    content: "Click to edit this note",
    color: "#fef3c7",
    position: {
      x: Math.random() * 200 + 20,
      y: Math.random() * 100 + 20,
      z: 0,
    },
    size: {
      width: 200,
      height: 200,
    },
  };
};

/**
 * Handle mouse down event for dragging
 */
export const handleMouseDown = (e) => {
  if (shouldIgnoreDrag(e)) {
    return { shouldStartDrag: false };
  }

  const dragOffset = calculateDragOffset(e, e.currentTarget);
  return {
    dragOffset,
    shouldStartDrag: true,
  };
};

/**
 * Handle mouse move event for dragging
 */
export const handleMouseMove = (e, draggedNote, dragOffset) => {
  const containerRect = document
    .querySelector(".sticky-notes-container")
    ?.getBoundingClientRect();

  if (!containerRect) return null;

  return calculateNewPosition(e, containerRect, dragOffset);
};

/**
 * Handle mouse up event for dragging
 */
export const handleMouseUp = () => {
  return () => {
    document.body.style.userSelect = "";
  };
};

/**
 * Default colors for sticky notes
 */
export const DEFAULT_COLORS = [
  "#fef3c7", // Yellow
  "#dcfce7", // Green
  "#dbeafe", // Blue
  "#f3e8ff", // Purple
  "#fed7d7", // Red
  "#fbb6ce", // Pink
  "#d6f5d6", // Light Green
  "#b6e6ff", // Light Blue
];

/**
 * Prevent text selection during drag
 */
export const preventTextSelection = () => {
  document.body.style.userSelect = "none";
};

/**
 * Restore text selection after drag
 */
export const restoreTextSelection = () => {
  document.body.style.userSelect = "";
};
