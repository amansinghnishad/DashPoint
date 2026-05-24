const CHAT_PROVIDERS = Object.freeze({
  AUTO: 'auto',
  OPENAI: 'openai',
  GEMINI: 'gemini'
});

const OPENAI_DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MODEL_TIERS = Object.freeze({
  FAST: 'fast',
  BALANCED: 'balanced',
  STRONG: 'strong'
});

const MODEL_BY_PROVIDER_AND_TIER = Object.freeze({
  [CHAT_PROVIDERS.OPENAI]: {
    [MODEL_TIERS.FAST]: process.env.OPENAI_FAST_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    [MODEL_TIERS.BALANCED]:
      process.env.OPENAI_BALANCED_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    [MODEL_TIERS.STRONG]: process.env.OPENAI_STRONG_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1'
  },
  [CHAT_PROVIDERS.GEMINI]: {
    [MODEL_TIERS.FAST]: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    [MODEL_TIERS.BALANCED]:
      process.env.GEMINI_BALANCED_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    [MODEL_TIERS.STRONG]:
      process.env.GEMINI_STRONG_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-pro'
  }
});

const TOOL_INTENT_PATTERNS = [
  /\b(create|save|add|schedule|connect|list|upload|extract|remember|store|update|delete|summarize this|summarise this)\b/i,
  /\b(calendar|collection|file|youtube|planner|task|todo|action item|working hours|meeting)\b/i
];

const STRONG_REASONING_PATTERNS = [
  /\b(analy[sz]e|compare|evaluate|debug|architect|design|strategy|trade-?offs?|pros and cons|root cause|explain why|step by step|reason|complex|deep|comprehensive)\b/i,
  /\b(plan|roadmap|workflow|prioriti[sz]e|break down|derive|prove|optimi[sz]e)\b/i
];

const FAST_PATTERNS = [
  /\b(hi|hello|hey|thanks|thank you|ok|okay|yes|no)\b/i,
  /\b(define|what is|who is|when is|where is|short|quick|brief|one line|summari[sz]e briefly)\b/i
];

const parseAutoProviderOrder = () => {
  const fallbackOrder = [CHAT_PROVIDERS.OPENAI, CHAT_PROVIDERS.GEMINI];
  const raw = String(process.env.CHAT_AUTO_PROVIDER_ORDER || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!raw.length) {
    return fallbackOrder;
  }

  const valid = raw.filter(
    (provider) => provider === CHAT_PROVIDERS.OPENAI || provider === CHAT_PROVIDERS.GEMINI
  );

  return valid.length ? [...new Set(valid)] : fallbackOrder;
};

const AUTO_PROVIDER_ORDER = parseAutoProviderOrder();

const normalizeProvider = (provider) =>
  String(provider || CHAT_PROVIDERS.AUTO)
    .trim()
    .toLowerCase();

const normalizeModel = (model) => String(model || 'auto').trim();

const hasCredentials = (provider) => {
  if (provider === CHAT_PROVIDERS.OPENAI) {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  if (provider === CHAT_PROVIDERS.GEMINI) {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  return false;
};

const inferProviderFromModel = (model) => {
  const lower = normalizeModel(model).toLowerCase();
  if (!lower || lower === 'auto') {
    return null;
  }

  if (lower.startsWith('gemini')) {
    return CHAT_PROVIDERS.GEMINI;
  }

  if (
    lower.startsWith('gpt') ||
    lower.startsWith('o1') ||
    lower.startsWith('o3') ||
    lower.startsWith('o4')
  ) {
    return CHAT_PROVIDERS.OPENAI;
  }

  return null;
};

const getDefaultModel = (provider) =>
  provider === CHAT_PROVIDERS.GEMINI ? GEMINI_DEFAULT_MODEL : OPENAI_DEFAULT_MODEL;

const getModelForTier = ({ provider, tier }) =>
  MODEL_BY_PROVIDER_AND_TIER[provider]?.[tier] || getDefaultModel(provider);

const scorePatternMatches = (patterns, value) =>
  patterns.reduce((score, pattern) => score + (pattern.test(value) ? 1 : 0), 0);

const classifyChatRouting = ({ message, topK = 3, collectionIds = [] }) => {
  const text = String(message || '').trim();
  const lowered = text.toLowerCase();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const hasCollections = Array.isArray(collectionIds) && collectionIds.length > 0;
  const requestedTopK = Number.parseInt(topK, 10) || 3;

  const toolIntentScore = scorePatternMatches(TOOL_INTENT_PATTERNS, lowered);
  const strongScore = scorePatternMatches(STRONG_REASONING_PATTERNS, lowered);
  const fastScore = scorePatternMatches(FAST_PATTERNS, lowered);

  const reasons = [];

  if (wordCount > 120) reasons.push('long_prompt');
  if (requestedTopK >= 5) reasons.push('large_retrieval');
  if (hasCollections) reasons.push('collection_scope');
  if (toolIntentScore > 0) reasons.push('tool_or_workspace_intent');
  if (strongScore > 0) reasons.push('reasoning_keywords');
  if (fastScore > 0) reasons.push('simple_keywords');

  if (strongScore > 0 || wordCount > 160 || requestedTopK >= 6) {
    return {
      tier: MODEL_TIERS.STRONG,
      reason: reasons.length ? reasons.join(',') : 'strong_default'
    };
  }

  if (toolIntentScore > 0 || hasCollections || wordCount > 60 || requestedTopK >= 4) {
    return {
      tier: MODEL_TIERS.BALANCED,
      reason: reasons.length ? reasons.join(',') : 'balanced_default'
    };
  }

  return {
    tier: MODEL_TIERS.FAST,
    reason: reasons.length ? reasons.join(',') : 'short_simple_prompt'
  };
};

const buildAttempt = ({ provider, model, route }) => ({
  provider,
  model:
    normalizeModel(model).toLowerCase() === 'auto'
      ? getModelForTier({ provider, tier: route.tier })
      : model,
  route
});

const buildChatProviderAttempts = ({ provider, model, message = '', topK = 3, collectionIds = [] }) => {
  const resolvedProvider = normalizeProvider(provider);
  const resolvedModel = normalizeModel(model);
  const inferredProvider = inferProviderFromModel(resolvedModel);
  const route = classifyChatRouting({
    message,
    topK,
    collectionIds
  });

  if (
    resolvedProvider !== CHAT_PROVIDERS.AUTO &&
    resolvedProvider !== CHAT_PROVIDERS.OPENAI &&
    resolvedProvider !== CHAT_PROVIDERS.GEMINI
  ) {
    throw new Error(`Unsupported provider: ${resolvedProvider}`);
  }

  if (resolvedProvider !== CHAT_PROVIDERS.AUTO) {
    if (!hasCredentials(resolvedProvider)) {
      throw new Error(
        `${resolvedProvider.toUpperCase()} credentials are not configured for chat completion`
      );
    }

    return [
      buildAttempt({
        provider: resolvedProvider,
        model: resolvedModel,
        route: {
          ...route,
          mode: resolvedModel.toLowerCase() === 'auto' ? 'provider_auto' : 'explicit_model'
        }
      })
    ];
  }

  const attempts = [];

  if (inferredProvider && hasCredentials(inferredProvider)) {
    attempts.push(
      buildAttempt({
        provider: inferredProvider,
        model: resolvedModel,
        route: {
          ...route,
          mode: 'explicit_model'
        }
      })
    );
  }

  AUTO_PROVIDER_ORDER.forEach((candidateProvider) => {
    if (!hasCredentials(candidateProvider)) {
      return;
    }

    const hasExisting = attempts.some((attempt) => attempt.provider === candidateProvider);
    if (hasExisting) {
      return;
    }

    attempts.push(
      buildAttempt({
        provider: candidateProvider,
        model: inferredProvider === candidateProvider ? resolvedModel : 'auto',
        route: {
          ...route,
          mode: inferredProvider === candidateProvider ? 'explicit_model' : 'auto'
        }
      })
    );
  });

  if (!attempts.length) {
    throw new Error(
      'No AI providers are configured. Set OPENAI_API_KEY and/or GEMINI_API_KEY.'
    );
  }

  return attempts;
};

module.exports = {
  CHAT_PROVIDERS,
  MODEL_TIERS,
  classifyChatRouting,
  buildChatProviderAttempts
};
