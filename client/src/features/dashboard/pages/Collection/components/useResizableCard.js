import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RESIZE_DIRECTIONS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const getCursorForResizeDir = (dir) => {
  switch (dir) {
    case "n":
      return "n-resize";
    case "s":
      return "s-resize";
    case "e":
      return "e-resize";
    case "w":
      return "w-resize";
    case "ne":
      return "ne-resize";
    case "nw":
      return "nw-resize";
    case "se":
      return "se-resize";
    case "sw":
      return "sw-resize";
    default:
      return "default";
  }
};

export function useResizableCard({
  layout,
  onLayoutChange,
  containerRef,
  viewportScale = 1,
  constrainToContainer = true,
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [liveLayout, setLiveLayout] = useState(null);
  const liveLayoutRef = useRef(null);
  const rafRef = useRef(null);

  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);

  const currentLayout = useMemo(
    () =>
      layout || {
        x: 0,
        y: 0,
        width: 320,
        height: 240,
      },
    [layout]
  );

  useEffect(() => {
    if (isDragging || isResizing) return;
    setLiveLayout(null);
    liveLayoutRef.current = null;
  }, [currentLayout, isDragging, isResizing]);

  const clampLayout = useCallback(
    (next, containerRectOverride) => {
      const minWidth = 280;
      const minHeight = 200;

      let width = Math.max(minWidth, next.width ?? currentLayout.width);
      let height = Math.max(minHeight, next.height ?? currentLayout.height);
      let x = next.x ?? currentLayout.x;
      let y = next.y ?? currentLayout.y;

      if (constrainToContainer) {
        const containerEl = containerRef?.current;
        const rawContainerRect =
          containerRectOverride ||
          (containerEl ? containerEl.getBoundingClientRect() : null);

        const safeScale =
          typeof viewportScale === "number" && viewportScale > 0
            ? viewportScale
            : 1;
        const containerRect = rawContainerRect
          ? {
            width: rawContainerRect.width / safeScale,
            height: rawContainerRect.height / safeScale,
          }
          : null;

        if (containerRect) {
          width = Math.min(width, Math.max(minWidth, containerRect.width));
          height = Math.min(height, Math.max(minHeight, containerRect.height));

          const maxX = Math.max(0, containerRect.width - width);
          const maxY = Math.max(0, containerRect.height - height);
          x = Math.min(Math.max(0, x), maxX);
          y = Math.min(Math.max(0, y), maxY);
        }
      }

      return { x, y, width, height };
    },
    [
      constrainToContainer,
      containerRef,
      currentLayout.height,
      currentLayout.width,
      currentLayout.x,
      currentLayout.y,
      viewportScale,
    ]
  );

  const commitLayout = useCallback(
    (next) => {
      onLayoutChange?.(clampLayout(next));
    },
    [clampLayout, onLayoutChange]
  );

  const scheduleLiveLayout = useCallback(
    (next) => {
      liveLayoutRef.current = next;
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setLiveLayout(liveLayoutRef.current);
      });
    },
    []
  );

  const handleResizeStart = useCallback(
    (e, dir) => {
      if (!RESIZE_DIRECTIONS.includes(dir)) return;
      e.preventDefault();
      e.stopPropagation();

      const containerRect = containerRef?.current
        ? containerRef.current.getBoundingClientRect()
        : null;

      if (typeof e.currentTarget?.setPointerCapture === "function") {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      resizeStartRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        startLayout: { ...currentLayout },
        dir,
        containerRect,
        scale: typeof viewportScale === "number" && viewportScale > 0 ? viewportScale : 1,
      };

      setIsResizing(true);
      setLiveLayout({ ...currentLayout });
      liveLayoutRef.current = { ...currentLayout };

      const onPointerMove = (moveEvent) => {
        const start = resizeStartRef.current;
        if (!start) return;
        if (moveEvent.pointerId !== start.pointerId) return;

        moveEvent.preventDefault?.();

        const dx = (moveEvent.clientX - start.x) / (start.scale || 1);
        const dy = (moveEvent.clientY - start.y) / (start.scale || 1);

        const next = { ...start.startLayout };
        const d = start.dir;

        // Horizontal
        if (d.includes("e")) {
          next.width = start.startLayout.width + dx;
        }
        if (d.includes("w")) {
          next.width = start.startLayout.width - dx;
          next.x = start.startLayout.x + dx;
        }

        // Vertical
        if (d.includes("s")) {
          next.height = start.startLayout.height + dy;
        }
        if (d.includes("n")) {
          next.height = start.startLayout.height - dy;
          next.y = start.startLayout.y + dy;
        }

        scheduleLiveLayout(clampLayout(next, start.containerRect));
      };

      const endResize = (endEvent) => {
        const start = resizeStartRef.current;
        if (!start) return;
        if (endEvent.pointerId !== start.pointerId) return;

        const finalLayout = liveLayoutRef.current || currentLayout;
        commitLayout(finalLayout);

        setIsResizing(false);
        resizeStartRef.current = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", endResize);
        document.removeEventListener("pointercancel", endResize);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", endResize);
      document.addEventListener("pointercancel", endResize);
      document.body.style.cursor = getCursorForResizeDir(dir);
      document.body.style.userSelect = "none";
    },
    [
      clampLayout,
      commitLayout,
      containerRef,
      currentLayout,
      scheduleLiveLayout,
      viewportScale,
    ]
  );

  const handleDragStart = useCallback(
    (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const containerRect = containerRef?.current
        ? containerRef.current.getBoundingClientRect()
        : null;

      if (typeof e.currentTarget?.setPointerCapture === "function") {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      dragStartRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        startLayout: { ...currentLayout },
        containerRect,
        scale: typeof viewportScale === "number" && viewportScale > 0 ? viewportScale : 1,
      };

      setIsDragging(true);

      setLiveLayout({ ...currentLayout });
      liveLayoutRef.current = { ...currentLayout };

      const onPointerMove = (moveEvent) => {
        const start = dragStartRef.current;
        if (!start) return;

        if (moveEvent.pointerId !== start.pointerId) return;

        moveEvent.preventDefault?.();

        const dx = (moveEvent.clientX - start.x) / (start.scale || 1);
        const dy = (moveEvent.clientY - start.y) / (start.scale || 1);

        scheduleLiveLayout(
          clampLayout(
            {
              ...start.startLayout,
              x: start.startLayout.x + dx,
              y: start.startLayout.y + dy,
            },
            start.containerRect
          )
        );
      };

      const endDrag = (endEvent) => {
        const start = dragStartRef.current;
        if (!start) return;
        if (endEvent.pointerId !== start.pointerId) return;

        const finalLayout = liveLayoutRef.current || currentLayout;
        commitLayout(finalLayout);

        setIsDragging(false);
        dragStartRef.current = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", endDrag);
        document.removeEventListener("pointercancel", endDrag);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
      document.body.style.cursor = e.pointerType === "mouse" ? "move" : "";
      document.body.style.userSelect = "none";
    },
    [
      clampLayout,
      commitLayout,
      containerRef,
      currentLayout,
      scheduleLiveLayout,
      viewportScale,
    ]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  return {
    currentLayout: liveLayout || currentLayout,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
  };
}
