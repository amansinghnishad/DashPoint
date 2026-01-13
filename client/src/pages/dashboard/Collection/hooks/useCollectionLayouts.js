import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const getItemKeyDefault = (it) => {
  if (!it) return "";
  if (it.itemType && it.itemId) return `${it.itemType}:${it.itemId}`;
  if (it._id) return String(it._id);
  if (it.itemId) return String(it.itemId);
  return "";
};

const getBreakpoint = (w) => {
  const width = typeof w === "number" && Number.isFinite(w) ? w : 1200;
  if (width < 480) return "xs";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  return "lg";
};

export default function useCollectionLayouts({
  collectionId,
  items,
  canvasRef,
  getItemKey = getItemKeyDefault,
  initialLayouts,
  persistLayouts,
}) {
  const layoutStorageKeyV2 = useMemo(() => {
    if (!collectionId) return null;
    return `dashpoint:collection-layouts-v2:${collectionId}`;
  }, [collectionId]);

  const legacyLayoutStorageKeyV1 = useMemo(() => {
    if (!collectionId) return null;
    return `dashpoint:collection-layout:${collectionId}`;
  }, [collectionId]);

  const [layoutsByItemKey, setLayoutsByItemKey] = useState({});

  const latestPayloadRef = useRef(null);
  const latestSentRef = useRef(null);
  const inflightPersistRef = useRef(null);

  const getCanvasRect = useCallback(() => {
    const el = canvasRef?.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [canvasRef]);

  const sanitizeLayout = useCallback((layout, gap) => {
    const minW = 280;
    const minH = 200;

    const x = Number(layout?.x);
    const y = Number(layout?.y);
    const width = Number(layout?.width);
    const height = Number(layout?.height);

    // Important: the collection canvas is a pan/zoom "world".
    // Do NOT clamp x/y to the visible canvas size, otherwise items that the user
    // intentionally moved outside the viewport will "snap back" after refresh.
    const nextX = Number.isFinite(x) ? x : gap;
    const nextY = Number.isFinite(y) ? y : gap;

    const nextW = Math.max(Number.isFinite(width) ? width : minW, minW);
    const nextH = Math.max(Number.isFinite(height) ? height : minH, minH);

    return { x: nextX, y: nextY, width: nextW, height: nextH };
  }, []);

  const buildPayload = useCallback((map, rect) => {
    const safe = map && typeof map === "object" ? map : {};
    return {
      version: 2,
      items: safe,
      meta: {
        canvasWidth: rect?.width,
        canvasHeight: rect?.height,
        savedAt: Date.now(),
      },
    };
  }, []);

  const parseToMap = useCallback(
    (value, preferredBp) => {
      if (!value || typeof value !== "object") return null;

      // v2 (new): { version: 2, items: { [key]: {x,y,width,height} } }
      if (value.version === 2 && value.items && typeof value.items === "object") {
        return value.items;
      }

      // v2 (old): { version: 2, breakpoints: { xs|sm|md|lg: { items: {...} } } }
      if (value.version === 2 && value.breakpoints && typeof value.breakpoints === "object") {
        const bp = preferredBp && value.breakpoints[preferredBp] ? preferredBp : null;
        const preferredItems = bp ? value.breakpoints[bp]?.items : null;
        if (preferredItems && typeof preferredItems === "object") {
          return preferredItems;
        }

        for (const candidate of ["lg", "md", "sm", "xs"]) {
          const itemsMap = value.breakpoints?.[candidate]?.items;
          if (itemsMap && typeof itemsMap === "object") return itemsMap;
        }

        return null;
      }

      // v1: plain map
      const keys = Object.keys(value);
      const looksLikeMap =
        keys.length === 0 ||
        keys.every((k) => {
          const v = value[k];
          return v && typeof v === "object" && ("x" in v || "width" in v);
        });
      if (looksLikeMap) return value;

      return null;
    },
    []
  );

  // Load saved layout on collection change.
  // Important: server is authoritative; localStorage is only fallback.
  useEffect(() => {
    if (!collectionId) return;

    const rect = getCanvasRect();
    const preferredBp = getBreakpoint(rect?.width);

    const fromServer = parseToMap(initialLayouts, preferredBp);
    if (fromServer) {
      setLayoutsByItemKey(fromServer);
      return;
    }

    // LocalStorage v2 fallback
    if (layoutStorageKeyV2) {
      try {
        const raw = window.localStorage.getItem(layoutStorageKeyV2);
        const parsed = raw ? JSON.parse(raw) : null;
        const map = parseToMap(parsed, preferredBp);
        if (map) {
          setLayoutsByItemKey(map);
          // Migrate fallback -> server so refresh/device switch stays consistent.
          if (typeof persistLayouts === "function") {
            const payload = buildPayload(map, rect);
            persistLayouts(payload);
          }
          return;
        }
      } catch {
        // ignore
      }
    }

    // Legacy v1 fallback
    if (legacyLayoutStorageKeyV1) {
      try {
        const raw = window.localStorage.getItem(legacyLayoutStorageKeyV1);
        const parsed = raw ? JSON.parse(raw) : null;
        const map = parseToMap(parsed, preferredBp);
        if (map) {
          setLayoutsByItemKey(map);
          if (typeof persistLayouts === "function") {
            const payload = buildPayload(map, rect);
            persistLayouts(payload);
          }
          return;
        }
      } catch {
        // ignore
      }
    }

    setLayoutsByItemKey({});
  }, [buildPayload, collectionId, getCanvasRect, initialLayouts, layoutStorageKeyV2, legacyLayoutStorageKeyV1, parseToMap, persistLayouts]);

  // Ensure every item has a layout; remove stale entries; clamp to canvas.
  useEffect(() => {
    setLayoutsByItemKey((prev) => {
      const next = prev && typeof prev === "object" ? { ...prev } : {};

      const existingIds = new Set(
        (items || [])
          .map(getItemKey)
          .filter((k) => typeof k === "string" && k.length)
      );

      Object.keys(next).forEach((key) => {
        if (!existingIds.has(key)) delete next[key];
      });

      const gap = 16;
      const rect = getCanvasRect();
      const canvasW = rect?.width ?? 1200;
      const canvasH = rect?.height ?? 700;

      // Responsive defaults: keep cards usable on narrow screens.
      const cardW = Math.min(320, Math.max(280, canvasW - gap * 2));
      const cardH = canvasW < 480 ? 220 : 240;
      const cols = Math.max(1, Math.floor((canvasW - gap) / (cardW + gap)));

      (items || []).forEach((it, index) => {
        const key = getItemKey(it);
        if (!key) return;

        if (next[key]) {
          next[key] = sanitizeLayout(next[key], gap);
          return;
        }

        const col = index % cols;
        const row = Math.floor(index / cols);
        let x = col * (cardW + gap) + gap;
        let y = row * (cardH + gap) + gap;

        if (x + cardW > canvasW - gap) x = gap;
        if (y + cardH > canvasH - gap) {
          x = gap;
          y = gap;
        }

        next[key] = sanitizeLayout({ x, y, width: cardW, height: cardH }, gap);
      });

      return next;
    });
  }, [getCanvasRect, getItemKey, items, sanitizeLayout]);

  // Persist layouts (debounced): always store local fallback + update server.
  useEffect(() => {
    if (!collectionId) return;

    const rect = getCanvasRect();
    const payload = buildPayload(layoutsByItemKey, rect);
    latestPayloadRef.current = payload;

    const t = window.setTimeout(() => {
      if (layoutStorageKeyV2) {
        try {
          window.localStorage.setItem(layoutStorageKeyV2, JSON.stringify(payload));
        } catch {
          // ignore
        }
      }

      if (typeof persistLayouts !== "function") return;

      try {
        const serialized = JSON.stringify(payload);
        if (serialized === latestSentRef.current) return;
        latestSentRef.current = serialized;

        if (inflightPersistRef.current) return;

        const p = Promise.resolve(persistLayouts(payload))
          .catch(() => {
            latestSentRef.current = null;
          })
          .finally(() => {
            inflightPersistRef.current = null;
          });

        inflightPersistRef.current = p;
      } catch {
        // ignore
      }
    }, 600);

    return () => window.clearTimeout(t);
  }, [buildPayload, collectionId, getCanvasRect, layoutStorageKeyV2, layoutsByItemKey, persistLayouts]);

  // Flush on tab close.
  useEffect(() => {
    if (!collectionId) return;

    const flush = () => {
      const payload = latestPayloadRef.current;
      if (!payload) return;

      if (layoutStorageKeyV2) {
        try {
          window.localStorage.setItem(layoutStorageKeyV2, JSON.stringify(payload));
        } catch {
          // ignore
        }
      }

      if (typeof persistLayouts === "function") {
        try {
          persistLayouts(payload);
        } catch {
          // ignore
        }
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
  }, [collectionId, layoutStorageKeyV2, persistLayouts]);

  return { layoutsByItemKey, setLayoutsByItemKey };
}
