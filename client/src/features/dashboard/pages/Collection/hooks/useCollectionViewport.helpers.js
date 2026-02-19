const MIN_SCALE = 0.25;
const MAX_SCALE = 3;

// Target guard
export const isEditableTarget = (target) => {
  const el = target && target.nodeType === 1 ? target : null;
  if (!el) return false;

  if (el.isContentEditable) return true;

  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;

  const closest =
    typeof el.closest === "function"
      ? el.closest("input,textarea,select,[contenteditable='true']")
      : null;

  return Boolean(closest);
};

// Key check
export const isSpaceKey = (event) => event.code === "Space" || event.key === " ";

// Shortcut check
export const isZoomOrBrowserShortcut = (event) => {
  if (!event.ctrlKey && !event.metaKey) return false;

  const key = typeof event.key === "string" ? event.key : "";
  const lower = key.toLowerCase();
  const code = typeof event.code === "string" ? event.code : "";

  const isZoomKey =
    key === "+" ||
    key === "=" ||
    key === "-" ||
    key === "_" ||
    key === "0" ||
    code === "NumpadAdd" ||
    code === "NumpadSubtract";

  const isBrowserActionKey =
    lower === "f" ||
    lower === "p" ||
    lower === "s" ||
    lower === "r" ||
    lower === "g" ||
    lower === "h";

  return isZoomKey || isBrowserActionKey;
};

// Scale clamp
export const clampScaleValue = (value) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

// Layout bounds
export const getLayoutsBounds = (layoutsByItemKey) => {
  const layouts =
    layoutsByItemKey && typeof layoutsByItemKey === "object"
      ? layoutsByItemKey
      : {};

  const keys = Object.keys(layouts);
  if (!keys.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const key of keys) {
    const layout = layouts[key];
    if (!layout) continue;

    const x = Number(layout.x);
    const y = Number(layout.y);
    const width = Number(layout.width);
    const height = Number(layout.height);

    if (![x, y, width, height].every(Number.isFinite)) continue;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return null;
  }

  return { minX, minY, maxX, maxY };
};
