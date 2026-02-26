const CHAT_PROVIDERS = Object.freeze({
  AUTO: 'auto',
  OPENAI: 'openai',
  GEMINI: 'gemini'
});

const OPENAI_DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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

const buildAttempt = ({ provider, model }) => ({
  provider,
  model: normalizeModel(model).toLowerCase() === 'auto' ? getDefaultModel(provider) : model
});

const buildChatProviderAttempts = ({ provider, model }) => {
  const resolvedProvider = normalizeProvider(provider);
  const resolvedModel = normalizeModel(model);
  const inferredProvider = inferProviderFromModel(resolvedModel);

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

    return [buildAttempt({ provider: resolvedProvider, model: resolvedModel })];
  }

  const attempts = [];

  if (inferredProvider && hasCredentials(inferredProvider)) {
    attempts.push(buildAttempt({ provider: inferredProvider, model: resolvedModel }));
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
        model: inferredProvider === candidateProvider ? resolvedModel : 'auto'
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
  buildChatProviderAttempts
};
