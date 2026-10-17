
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeQuery = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

const clampLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, parsed));
};

const truncate = (value, maxLength = 220) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
};

const toIso = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const buildRegex = (query) => new RegExp(escapeRegex(query), 'i');

const buildResult = ({
  type,
  id,
  title,
  subtitle = '',
  snippet = '',
  url = '',
  score = 1,
  metadata = {}
}) => ({
  type,
  id: String(id || ''),
  title: String(title || 'Untitled').trim(),
  subtitle: String(subtitle || '').trim(),
  snippet: truncate(snippet),
  url: String(url || '').trim(),
  score,
  metadata
});

module.exports = {
  normalizeQuery,
  clampLimit,
  buildRegex,
  buildResult,
  toIso
};
