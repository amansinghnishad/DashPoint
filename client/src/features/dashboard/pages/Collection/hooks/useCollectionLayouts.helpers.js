const MIN_CARD_WIDTH = 280;
const MIN_CARD_HEIGHT = 200;
const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_CANVAS_HEIGHT = 700;
const DEFAULT_GAP = 16;
const PERSIST_DELAY_MS = 600;

const getSafeObject = (value) =>
  value && typeof value === "object" ? value : {};

const getSafeNumber = (value, fallback) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

// Layout key
export const getItemKeyDefault = (item) => {
  if (!item) return "";
  if (item.itemType && item.itemId) return `${item.itemType}:${item.itemId}`;
  if (item._id) return String(item._id);
  if (item.itemId) return String(item.itemId);
  return "";
};

// Layout clean
export const sanitizeLayout = (layout, gap) => {
  const nextX = getSafeNumber(layout?.x, gap);
  const nextY = getSafeNumber(layout?.y, gap);
  const nextWidth = Math.max(
    getSafeNumber(layout?.width, MIN_CARD_WIDTH),
    MIN_CARD_WIDTH
  );
  const nextHeight = Math.max(
    getSafeNumber(layout?.height, MIN_CARD_HEIGHT),
    MIN_CARD_HEIGHT
  );

  return {
    x: nextX,
    y: nextY,
    width: nextWidth,
    height: nextHeight,
  };
};

// Layout payload
export const buildPayload = (layoutMap, rect) => ({
  version: 2,
  items: getSafeObject(layoutMap),
  meta: {
    canvasWidth: rect?.width,
    canvasHeight: rect?.height,
    savedAt: Date.now(),
  },
});

// Width tier
export const getBreakpoint = (width) => {
  const safeWidth =
    typeof width === "number" && Number.isFinite(width)
      ? width
      : DEFAULT_CANVAS_WIDTH;

  if (safeWidth < 480) return "xs";
  if (safeWidth < 768) return "sm";
  if (safeWidth < 1024) return "md";
  return "lg";
};

// Layout parse
export const parseToMap = (value, preferredBp) => {
  if (!value || typeof value !== "object") return null;

  if (value.version === 2 && value.items && typeof value.items === "object") {
    return value.items;
  }

  if (
    value.version === 2 &&
    value.breakpoints &&
    typeof value.breakpoints === "object"
  ) {
    if (preferredBp && value.breakpoints[preferredBp]?.items) {
      return value.breakpoints[preferredBp].items;
    }

    for (const candidateBp of ["lg", "md", "sm", "xs"]) {
      const candidateItems = value.breakpoints?.[candidateBp]?.items;
      if (candidateItems && typeof candidateItems === "object") {
        return candidateItems;
      }
    }

    return null;
  }

  const keys = Object.keys(value);
  const looksLikeLegacyMap =
    keys.length === 0 ||
    keys.every((key) => {
      const candidate = value[key];
      return (
        candidate &&
        typeof candidate === "object" &&
        ("x" in candidate || "width" in candidate)
      );
    });

  return looksLikeLegacyMap ? value : null;
};

// Storage read
export const readStorageLayout = (storageKey, preferredBp) => {
  if (!storageKey) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parseToMap(parsed, preferredBp);
  } catch {
    return null;
  }
};

// Storage write
export const writeStorageLayout = (storageKey, payload) => {
  if (!storageKey) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore write
  }
};

export const LAYOUT_DEFAULTS = {
  minCardWidth: MIN_CARD_WIDTH,
  defaultCanvasWidth: DEFAULT_CANVAS_WIDTH,
  defaultCanvasHeight: DEFAULT_CANVAS_HEIGHT,
  defaultGap: DEFAULT_GAP,
  persistDelayMs: PERSIST_DELAY_MS,
};

export const getSafeLayoutMap = (value) => getSafeObject(value);
