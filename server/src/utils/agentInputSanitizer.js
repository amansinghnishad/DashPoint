const MAX_MESSAGE_LENGTH = 4000;
const MAX_MODEL_LENGTH = 100;
const MAX_PROVIDER_LENGTH = 20;
const MAX_COLLECTION_IDS = 50;
const DEFAULT_TOP_K = 3;
const MIN_TOP_K = 1;
const MAX_TOP_K = 8;
const ALLOWED_PROVIDERS = new Set(['auto', 'openai', 'gemini']);
const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const normalizeUnicode = (value) => {
  try {
    return String(value || '').normalize('NFKC');
  } catch {
    return String(value || '');
  }
};

const sanitizePlainText = (value, { maxLength = MAX_MESSAGE_LENGTH } = {}) =>
  normalizeUnicode(value)
    // Remove control chars except \n and \t.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\r\n?/g, '\n')
    // Normalize extra horizontal whitespace.
    .replace(/[ \t]{2,}/g, ' ')
    // Cap excessive vertical whitespace.
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);

const sanitizeProvider = (value) => {
  const normalized = sanitizePlainText(value, { maxLength: MAX_PROVIDER_LENGTH })
    .toLowerCase();
  if (!normalized) return 'auto';
  return ALLOWED_PROVIDERS.has(normalized) ? normalized : 'auto';
};

const sanitizeModel = (value) => sanitizePlainText(value, { maxLength: MAX_MODEL_LENGTH }) || 'auto';

const sanitizeTopK = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TOP_K;
  }
  return Math.max(MIN_TOP_K, Math.min(MAX_TOP_K, parsed));
};

const sanitizeCollectionIds = (collectionIds = []) =>
  [...new Set((Array.isArray(collectionIds) ? collectionIds : [])
    .map((id) => String(id || '').trim())
    .filter((id) => OBJECT_ID_PATTERN.test(id))
    .slice(0, MAX_COLLECTION_IDS))];

const sanitizeChatInput = (payload = {}) => ({
  message: sanitizePlainText(payload.message, { maxLength: MAX_MESSAGE_LENGTH }),
  provider: sanitizeProvider(payload.provider),
  model: sanitizeModel(payload.model),
  topK: sanitizeTopK(payload.topK),
  collectionIds: sanitizeCollectionIds(payload.collectionIds)
});

module.exports = {
  sanitizePlainText,
  sanitizeProvider,
  sanitizeModel,
  sanitizeTopK,
  sanitizeCollectionIds,
  sanitizeChatInput
};
