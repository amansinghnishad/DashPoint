import { MAX_MESSAGE_LENGTH, STREAM_MAX_UPDATES, STREAM_MIN_UPDATES } from "./chatBar.constants";

const EXTRA_HORIZONTAL_SPACE_PATTERN = /[ \t]{2,}/g;
const EXTRA_NEWLINE_PATTERN = /\n{3,}/g;

const normalizeUnicode = (value) => {
  try {
    return String(value || "").normalize("NFKC");
  } catch {
    return String(value || "");
  }
};

const isDisallowedControlCode = (code) =>
  (code >= 0 && code <= 8) ||
  code === 11 ||
  code === 12 ||
  (code >= 14 && code <= 31) ||
  code === 127;

const replaceControlCharsWithSpace = (value) => {
  let mutated = false;
  const sanitized = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    if (!isDisallowedControlCode(code)) return char;
    mutated = true;
    return " ";
  });
  return mutated ? sanitized.join("") : value;
};

export const sanitizeMessageForSubmit = (value) =>
  replaceControlCharsWithSpace(normalizeUnicode(value))
    .replace(/\r\n?/g, "\n")
    .replace(EXTRA_HORIZONTAL_SPACE_PATTERN, " ")
    .replace(EXTRA_NEWLINE_PATTERN, "\n\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);

export const getStreamStepSize = (textLength) => {
  if (textLength <= 0) return 1;

  const targetUpdates = Math.max(
    STREAM_MIN_UPDATES,
    Math.min(STREAM_MAX_UPDATES, Math.ceil(textLength / 90)),
  );

  return Math.max(20, Math.ceil(textLength / targetUpdates));
};

export const buildMetaLabel = (meta) => {
  if (!meta) return "";

  const provider = String(meta.provider || "").trim();
  const model = String(meta.model || "").trim();
  const hitCount = Number(meta?.retrieval?.hitCount || 0);

  const parts = [];
  if (provider && model) parts.push(`${provider}/${model}`);
  if (provider && !model) parts.push(provider);
  if (hitCount > 0) parts.push(`${hitCount} context`);

  return parts.join(" | ");
};
