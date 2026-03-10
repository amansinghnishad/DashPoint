import {
  MAX_MESSAGE_LENGTH,
  STREAM_MAX_UPDATES,
  STREAM_MIN_UPDATES,
} from "./chatBar.constants";

const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EXTRA_HORIZONTAL_SPACE_PATTERN = /[ \t]{2,}/g;
const EXTRA_NEWLINE_PATTERN = /\n{3,}/g;

const normalizeUnicode = (value) => {
  try {
    return String(value || "").normalize("NFKC");
  } catch {
    return String(value || "");
  }
};

export const sanitizeMessageForSubmit = (value) =>
  normalizeUnicode(value)
    .replace(CONTROL_CHAR_PATTERN, " ")
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

export const normalizeCollectionsResponse = (response) => {
  const list =
    response?.data?.collections ?? response?.data?.data?.collections ?? [];
  if (!Array.isArray(list)) return [];

  return list
    .map((collection) => {
      const id = String(collection?._id || collection?.id || "").trim();
      if (!id) return null;

      return {
        id,
        name: String(collection?.name || "Untitled").trim() || "Untitled",
      };
    })
    .filter(Boolean);
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
