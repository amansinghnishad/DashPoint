import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampScaleValue,
  getLayoutsBounds,
  isEditableTarget,
  isSpaceKey,
  isZoomOrBrowserShortcut,
} from "./useCollectionViewport.helpers";

// View controls
export default function useCollectionViewport({
  canvasRef,
  worldRef,
  layoutsByItemKey,
}) {
  const spacePressedRef = useRef(false);
  const panRef = useRef(null);
  const activePointersRef = useRef(new Map());
  const pinchRef = useRef(null);

  const viewportStateRef = useRef({ scale: 1, offset: { x: 0, y: 0 } });

  const [viewportScale, setViewportScale] = useState(1);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    viewportStateRef.current = { scale: viewportScale, offset: viewportOffset };
  }, [viewportOffset, viewportScale]);

  const clampScale = useCallback((s) => {
    return clampScaleValue(s);
  }, []);

  useEffect(() => {
    const surface = canvasRef?.current;
    if (!surface) return;

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = surface.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const { scale: curScale, offset: curOffset } = viewportStateRef.current;

      const worldX = (cursorX - curOffset.x) / curScale;
      const worldY = (cursorY - curOffset.y) / curScale;

      const zoomFactor = Math.exp(-e.deltaY * 0.002);
      const nextScale = clampScale(curScale * zoomFactor);

      const nextOffsetX = cursorX - worldX * nextScale;
      const nextOffsetY = cursorY - worldY * nextScale;

      setViewportScale(nextScale);
      setViewportOffset({ x: nextOffsetX, y: nextOffsetY });
    };

    surface.addEventListener("wheel", onWheel, { passive: false });
    return () => surface.removeEventListener("wheel", onWheel);
  }, [canvasRef, clampScale]);

  useEffect(() => {
    const surface = canvasRef?.current;
    if (!surface) return;

    const activePointers = activePointersRef.current;

    const setGrabCursor = () => {
      if (panRef.current) return;
      surface.style.cursor = spacePressedRef.current ? "grab" : "";
    };

    const onKeyDown = (e) => {
      if (!isSpaceKey(e)) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      if (!spacePressedRef.current) {
        spacePressedRef.current = true;
        setGrabCursor();
      }
    };

    const onKeyUp = (e) => {
      if (!isSpaceKey(e)) return;
      if (spacePressedRef.current) {
        spacePressedRef.current = false;
        setGrabCursor();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });

    const onPointerDownCapture = (e) => {
      if (e.pointerType === "touch") {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 2) {
          panRef.current = null;

          const pts = Array.from(activePointers.values());
          const p1 = pts[0];
          const p2 = pts[1];
          const startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
          const midClientX = (p1.x + p2.x) / 2;
          const midClientY = (p1.y + p2.y) / 2;

          const rect = surface.getBoundingClientRect();
          const midX = midClientX - rect.left;
          const midY = midClientY - rect.top;

          const { scale: curScale, offset: curOffset } =
            viewportStateRef.current;
          const safeScale =
            typeof curScale === "number" && curScale > 0 ? curScale : 1;

          const worldX = (midX - (curOffset?.x ?? 0)) / safeScale;
          const worldY = (midY - (curOffset?.y ?? 0)) / safeScale;

          pinchRef.current = {
            startDist,
            startScale: safeScale,
            worldX,
            worldY,
          };

          e.preventDefault();
          e.stopPropagation();
        }

        return;
      }

      if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return;
      if (isEditableTarget(e.target)) return;

      const surfaceEl = canvasRef?.current;
      const worldEl = worldRef?.current;
      const isBackgroundTarget = e.target === surfaceEl || e.target === worldEl;
      const isMiddle = e.button === 1;
      const isSpacePan = spacePressedRef.current && e.button === 0;
      const isBackgroundPan = isBackgroundTarget && e.button === 0;

      if (!isMiddle && !isSpacePan && !isBackgroundPan) return;

      e.preventDefault();
      e.stopPropagation();

      try {
        surfaceEl?.setPointerCapture?.(e.pointerId);
      } catch {
        // Ignore capture
      }

      panRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startOffset: viewportStateRef.current.offset,
      };

      surface.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      if (e.pointerType === "touch") {
        if (activePointers.has(e.pointerId)) {
          activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        const pinch = pinchRef.current;
        if (pinch && activePointers.size >= 2) {
          const pts = Array.from(activePointers.values());
          const p1 = pts[0];
          const p2 = pts[1];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
          const ratio = dist / (pinch.startDist || 1);

          const nextScale = clampScale((pinch.startScale || 1) * ratio);

          const midClientX = (p1.x + p2.x) / 2;
          const midClientY = (p1.y + p2.y) / 2;
          const rect = surface.getBoundingClientRect();
          const midX = midClientX - rect.left;
          const midY = midClientY - rect.top;

          const nextOffsetX = midX - pinch.worldX * nextScale;
          const nextOffsetY = midY - pinch.worldY * nextScale;

          e.preventDefault?.();

          setViewportScale(nextScale);
          setViewportOffset({ x: nextOffsetX, y: nextOffsetY });
          return;
        }
      }

      const pan = panRef.current;
      if (!pan) return;
      if (e.pointerId !== pan.pointerId) return;

      e.preventDefault?.();

      const dx = e.clientX - pan.startX;
      const dy = e.clientY - pan.startY;
      setViewportOffset({
        x: (pan.startOffset?.x ?? 0) + dx,
        y: (pan.startOffset?.y ?? 0) + dy,
      });
    };

    const onPointerUpOrCancel = (e) => {
      if (e.pointerType === "touch") {
        activePointers.delete(e.pointerId);
        if (activePointers.size < 2) {
          pinchRef.current = null;
        }
      }

      const pan = panRef.current;
      if (!pan) return;
      if (e.pointerId !== pan.pointerId) return;

      panRef.current = null;
      surface.style.cursor = spacePressedRef.current ? "grab" : "";
    };

    surface.addEventListener("pointerdown", onPointerDownCapture, {
      capture: true,
    });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUpOrCancel, { passive: true });
    window.addEventListener("pointercancel", onPointerUpOrCancel, {
      passive: true,
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      surface.removeEventListener("pointerdown", onPointerDownCapture, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUpOrCancel);
      window.removeEventListener("pointercancel", onPointerUpOrCancel);
      surface.style.cursor = "";
      panRef.current = null;
      pinchRef.current = null;
      activePointers.clear();
      spacePressedRef.current = false;
    };
  }, [canvasRef, clampScale, worldRef]);

  useEffect(() => {
    const onKeyDownCapture = (e) => {
      if (!isZoomOrBrowserShortcut(e)) return;

      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("keydown", onKeyDownCapture, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDownCapture, {
        capture: true,
      });
    };
  }, []);

  const recenterViewport = useCallback(() => {
    const surface = canvasRef?.current;
    if (!surface) return;

    const rect = surface.getBoundingClientRect();
    const scale =
      typeof viewportScale === "number" && viewportScale > 0 ? viewportScale : 1;

    const bounds = getLayoutsBounds(layoutsByItemKey);
    if (!bounds) {
      setViewportOffset({ x: 0, y: 0 });
      return;
    }

    const worldCenterX = (bounds.minX + bounds.maxX) / 2;
    const worldCenterY = (bounds.minY + bounds.maxY) / 2;

    setViewportOffset({
      x: rect.width / 2 - worldCenterX * scale,
      y: rect.height / 2 - worldCenterY * scale,
    });
  }, [canvasRef, layoutsByItemKey, viewportScale]);

  return {
    viewportScale,
    viewportOffset,
    setViewportScale,
    setViewportOffset,
    recenterViewport,
  };
}