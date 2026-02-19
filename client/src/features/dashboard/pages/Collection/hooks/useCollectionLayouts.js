import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildPayload,
  getBreakpoint,
  getItemKeyDefault,
  getSafeLayoutMap,
  LAYOUT_DEFAULTS,
  parseToMap,
  readStorageLayout,
  sanitizeLayout,
  writeStorageLayout,
} from "./useCollectionLayouts.helpers";

// Layout state
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
  const pendingPersistRef = useRef(false);

  const getCanvasRect = useCallback(() => {
    const el = canvasRef?.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [canvasRef]);

  const flushPersist = useCallback(() => {
    if (typeof persistLayouts !== "function") return;

    const payload = latestPayloadRef.current;
    if (!payload) return;

    const serializedPayload = JSON.stringify(payload);
    if (serializedPayload === latestSentRef.current) return;

    if (inflightPersistRef.current) {
      pendingPersistRef.current = true;
      return;
    }

    inflightPersistRef.current = Promise.resolve(persistLayouts(payload))
      .then(() => {
        latestSentRef.current = serializedPayload;
      })
      .catch(() => {
        latestSentRef.current = null;
      })
      .finally(() => {
        inflightPersistRef.current = null;
        if (!pendingPersistRef.current) return;

        pendingPersistRef.current = false;
        flushPersist();
      });
  }, [persistLayouts]);

  useEffect(() => {
    if (!collectionId) return;

    const rect = getCanvasRect();
    const preferredBp = getBreakpoint(rect?.width);

    const fromServer = parseToMap(initialLayouts, preferredBp);
    if (fromServer) {
      setLayoutsByItemKey(fromServer);
      return;
    }

    const fromStorageV2 = readStorageLayout(layoutStorageKeyV2, preferredBp);
    if (fromStorageV2) {
      setLayoutsByItemKey(fromStorageV2);
      if (typeof persistLayouts === "function") {
        persistLayouts(buildPayload(fromStorageV2, rect));
      }
      return;
    }

    const fromStorageV1 = readStorageLayout(legacyLayoutStorageKeyV1, preferredBp);
    if (fromStorageV1) {
      setLayoutsByItemKey(fromStorageV1);
      if (typeof persistLayouts === "function") {
        persistLayouts(buildPayload(fromStorageV1, rect));
      }
      return;
    }

    setLayoutsByItemKey({});
  }, [
    collectionId,
    getCanvasRect,
    initialLayouts,
    layoutStorageKeyV2,
    legacyLayoutStorageKeyV1,
    persistLayouts,
  ]);

  useEffect(() => {
    setLayoutsByItemKey((prev) => {
      const next = { ...getSafeLayoutMap(prev) };

      const existingIds = new Set(
        (items || [])
          .map(getItemKey)
          .filter((k) => typeof k === "string" && k.length)
      );

      Object.keys(next).forEach((key) => {
        if (!existingIds.has(key)) delete next[key];
      });

      const gap = LAYOUT_DEFAULTS.defaultGap;
      const rect = getCanvasRect();
      const canvasW = rect?.width ?? LAYOUT_DEFAULTS.defaultCanvasWidth;
      const canvasH = rect?.height ?? LAYOUT_DEFAULTS.defaultCanvasHeight;

      const cardW = Math.min(
        320,
        Math.max(LAYOUT_DEFAULTS.minCardWidth, canvasW - gap * 2)
      );
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
  }, [getCanvasRect, getItemKey, items]);

  useEffect(() => {
    if (!collectionId) return;

    const rect = getCanvasRect();
    const payload = buildPayload(layoutsByItemKey, rect);
    latestPayloadRef.current = payload;

    const t = window.setTimeout(() => {
      writeStorageLayout(layoutStorageKeyV2, payload);
      flushPersist();
    }, LAYOUT_DEFAULTS.persistDelayMs);

    return () => window.clearTimeout(t);
  }, [
    collectionId,
    flushPersist,
    getCanvasRect,
    layoutStorageKeyV2,
    layoutsByItemKey,
  ]);

  useEffect(() => {
    if (!collectionId) return;

    const flush = () => {
      const payload = latestPayloadRef.current;
      if (!payload) return;

      writeStorageLayout(layoutStorageKeyV2, payload);

      if (typeof persistLayouts === "function") {
        try {
          persistLayouts(payload);
        } catch {
          // Ignore failure
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