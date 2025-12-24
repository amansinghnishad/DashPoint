import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const getItemKeyDefault = (it) => {
  if (!it) return "";
  if (it.itemType && it.itemId) return `${it.itemType}:${it.itemId}`;
  if (it._id) return String(it._id);
  if (it.itemId) return String(it.itemId);
  return "";
};

export default function useCollectionLayouts({
  collectionId,
  items,
  canvasRef,
  getItemKey = getItemKeyDefault,
}) {
  const layoutStorageKey = useMemo(() => {
    if (!collectionId) return null;
    return `dashpoint:collection-layout:${collectionId}`;
  }, [collectionId]);

  const [layoutsByItemKey, setLayoutsByItemKey] = useState({});
  const latestLayoutsRef = useRef({});

  const getCanvasRect = useCallback(() => {
    const el = canvasRef?.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [canvasRef]);

  useEffect(() => {
    latestLayoutsRef.current = layoutsByItemKey;
  }, [layoutsByItemKey]);

  // Load saved layout when collection changes
  useEffect(() => {
    if (!layoutStorageKey) return;
    try {
      const raw = window.localStorage.getItem(layoutStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setLayoutsByItemKey(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setLayoutsByItemKey({});
    }
  }, [layoutStorageKey]);

  // Ensure every item has a layout; remove stale entries
  useEffect(() => {
    setLayoutsByItemKey((prev) => {
      const next = { ...prev };
      const existingIds = new Set(
        (items || [])
          .map(getItemKey)
          .filter((k) => typeof k === "string" && k.length)
      );

      Object.keys(next).forEach((key) => {
        if (!existingIds.has(key)) delete next[key];
      });

      const cardW = 320;
      const cardH = 240;
      const gap = 16;

      const rect = getCanvasRect();
      const canvasW = rect?.width ?? 1200;
      const canvasH = rect?.height ?? 700;
      const cols = Math.max(1, Math.floor((canvasW - gap) / (cardW + gap)));

      (items || []).forEach((it, index) => {
        const key = getItemKey(it);
        if (!key) return;
        if (next[key]) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        let x = col * (cardW + gap) + gap;
        let y = row * (cardH + gap) + gap;

        if (x + cardW > canvasW - gap) x = gap;
        if (y + cardH > canvasH - gap) {
          x = gap;
          y = gap;
        }

        next[key] = { x, y, width: cardW, height: cardH };
      });

      return next;
    });
  }, [getCanvasRect, getItemKey, items]);

  // Persist layout (debounced)
  useEffect(() => {
    if (!layoutStorageKey) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(layoutsByItemKey)
        );
      } catch {
        // ignore
      }
    }, 200);

    return () => window.clearTimeout(t);
  }, [layoutStorageKey, layoutsByItemKey]);

  // Flush layouts immediately when leaving
  useEffect(() => {
    if (!layoutStorageKey) return;

    const flush = () => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(latestLayoutsRef.current || {})
        );
      } catch {
        // ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      flush();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [layoutStorageKey]);

  return { layoutsByItemKey, setLayoutsByItemKey };
}
