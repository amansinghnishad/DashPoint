const crypto = require('crypto');

const { getRedisClient } = require('../config/redis');

const DEFAULT_CHAT_CACHE_PREFIX = 'dashpoint:chat:agent:';
const DEFAULT_CHAT_CACHE_TTL_SECONDS = 24 * 60 * 60;

const normalizePrompt = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeCollectionIds = (collectionIds = []) =>
  [...new Set((Array.isArray(collectionIds) ? collectionIds : []).map((id) => String(id).trim()))]
    .filter(Boolean)
    .sort();

const normalizeTopK = (topK) => {
  const parsed = Number.parseInt(topK, 10);
  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.max(1, Math.min(parsed, 8));
};

const getChatCachePrefix = () =>
  String(process.env.CHAT_RESPONSE_CACHE_PREFIX || DEFAULT_CHAT_CACHE_PREFIX).trim();

const getChatCacheTtlSeconds = () => {
  const parsed = Number.parseInt(process.env.CHAT_RESPONSE_CACHE_TTL_SECONDS, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_CHAT_CACHE_TTL_SECONDS;
  }
  return parsed;
};

const buildChatContextId = ({
  userId,
  provider = 'auto',
  model = 'auto',
  topK = 3,
  collectionIds = [],
  attemptSignature = ''
}) => {
  const normalizedCollectionIds = normalizeCollectionIds(collectionIds);
  const scopeSegment = normalizedCollectionIds.length
    ? normalizedCollectionIds.join(',')
    : 'all';

  return [
    `u:${String(userId || '').trim()}`,
    `scope:${scopeSegment}`,
    `provider:${String(provider || 'auto').trim().toLowerCase() || 'auto'}`,
    `model:${String(model || 'auto').trim() || 'auto'}`,
    `topK:${normalizeTopK(topK)}`,
    `attempts:${String(attemptSignature || '').trim() || 'none'}`
  ].join('|');
};

const buildChatResponseCacheKey = ({ prompt, contextId }) => {
  const normalizedPrompt = normalizePrompt(prompt);
  const hashInput = `${normalizedPrompt}|${String(contextId || '').trim()}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  return `${getChatCachePrefix()}${hash}`;
};

const getCachedChatResponse = async ({ prompt, contextId }) => {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  const key = buildChatResponseCacheKey({ prompt, contextId });

  try {
    const raw = await redis.get(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      key,
      value: parsed
    };
  } catch (error) {
    console.warn('[ChatCache] Failed to read cache:', error.message);
    return null;
  }
};

const setCachedChatResponse = async ({ prompt, contextId, responsePayload }) => {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }

  const key = buildChatResponseCacheKey({ prompt, contextId });

  try {
    await redis.setEx(
      key,
      getChatCacheTtlSeconds(),
      JSON.stringify({
        ...responsePayload,
        cachedAt: new Date().toISOString()
      })
    );
    return true;
  } catch (error) {
    console.warn('[ChatCache] Failed to write cache:', error.message);
    return false;
  }
};

module.exports = {
  buildChatContextId,
  getCachedChatResponse,
  setCachedChatResponse
};
