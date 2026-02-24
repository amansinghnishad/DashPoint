const OpenAI = require('openai');
const axios = require('axios');

const NOTE_WIDGET_TYPES = ['notes', 'notes-tomorrow'];
const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const EMBEDDING_PROVIDER = String(process.env.EMBEDDING_PROVIDER || 'auto')
  .trim()
  .toLowerCase();
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MAX_EMBEDDING_INPUT_CHARS = 12000;
const GEMINI_EMBEDDING_FALLBACK_MODELS = ['gemini-embedding-001', 'text-embedding-004'];

let openAiClient = null;

const getOpenAiClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openAiClient;
};

const isNoteWidgetType = (widgetType) =>
  NOTE_WIDGET_TYPES.includes(String(widgetType || '').trim());

const buildPlannerWidgetEmbeddingText = ({ title, data }) => {
  const noteText = typeof data?.text === 'string' ? data.text : '';
  const heading = String(title || '').trim();
  const body = String(noteText || '').trim();

  return [heading, body].filter(Boolean).join('\n\n').trim();
};

const hasProviderCredentials = (provider) => {
  if (provider === 'openai') {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  if (provider === 'gemini') {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  return false;
};

const getDefaultProvider = () => {
  if (EMBEDDING_PROVIDER === 'openai' && hasProviderCredentials('openai')) {
    return 'openai';
  }

  if (EMBEDDING_PROVIDER === 'gemini' && hasProviderCredentials('gemini')) {
    return 'gemini';
  }

  if (hasProviderCredentials('openai')) {
    return 'openai';
  }

  if (hasProviderCredentials('gemini')) {
    return 'gemini';
  }

  return null;
};

const resolveEmbeddingConfig = (options = {}) => {
  const requestedProvider = String(options.provider || EMBEDDING_PROVIDER || 'auto')
    .trim()
    .toLowerCase();
  const provider =
    requestedProvider === 'auto' ? getDefaultProvider() : requestedProvider;

  if (!provider || !hasProviderCredentials(provider)) {
    return null;
  }

  const defaultModel =
    provider === 'gemini' ? GEMINI_EMBEDDING_MODEL : OPENAI_EMBEDDING_MODEL;
  const model = String(options.model || defaultModel).trim();

  if (!model) {
    return null;
  }

  return {
    provider,
    model
  };
};

const getEmbeddingModelLabel = (config) => {
  if (!config?.provider || !config?.model) {
    return '';
  }

  return `${config.provider}:${config.model}`;
};

const normalizeGeminiModelName = (model) =>
  String(model || '')
    .trim()
    .replace(/^models\//i, '');

const createOpenAiEmbedding = async ({ text, model }) => {
  const openai = getOpenAiClient();
  if (!openai) {
    return null;
  }

  const response = await openai.embeddings.create({
    model,
    input: String(text || '').slice(0, MAX_EMBEDDING_INPUT_CHARS)
  });

  return response?.data?.[0]?.embedding || null;
};

const createGeminiEmbedding = async ({ text, model, taskType }) => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const normalizedModel = normalizeGeminiModelName(model);
  const modelAttempts = [
    normalizedModel,
    ...GEMINI_EMBEDDING_FALLBACK_MODELS.filter(
      (candidate) => candidate !== normalizedModel
    )
  ];

  let lastError = null;

  for (const modelAttempt of modelAttempts) {
    try {
      const response = await axios.post(
        `${GEMINI_API_BASE_URL}/models/${modelAttempt}:embedContent`,
        {
          model: `models/${modelAttempt}`,
          content: {
            parts: [{ text: String(text || '').slice(0, MAX_EMBEDDING_INPUT_CHARS) }]
          },
          taskType: taskType || undefined
        },
        {
          params: {
            key: process.env.GEMINI_API_KEY
          },
          timeout: 30000
        }
      );

      return response?.data?.embedding?.values || null;
    } catch (error) {
      lastError = error;
      const status = Number(error?.response?.status || 0);
      const retryableForFallback = status === 400 || status === 404;
      if (retryableForFallback) {
        continue;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
};

const createEmbedding = async (text, options = {}) => {
  const normalized = String(text || '').trim();
  if (!normalized) {
    return null;
  }

  const resolved = resolveEmbeddingConfig(options);
  if (!resolved) {
    return null;
  }

  if (resolved.provider === 'gemini') {
    return createGeminiEmbedding({
      text: normalized,
      model: resolved.model,
      taskType: options.taskType
    });
  }

  return createOpenAiEmbedding({
    text: normalized,
    model: resolved.model
  });
};

const attachEmbeddingToPlannerWidget = async (widget) => {
  if (!widget || !isNoteWidgetType(widget.widgetType)) {
    return widget;
  }

  const inputText = buildPlannerWidgetEmbeddingText(widget);
  if (!inputText) {
    widget.embedding = undefined;
    widget.embeddingUpdatedAt = null;
    return widget;
  }

  const resolvedConfig = resolveEmbeddingConfig();
  let vector = null;
  try {
    vector = await createEmbedding(inputText, {
      taskType: 'RETRIEVAL_DOCUMENT',
      provider: resolvedConfig?.provider,
      model: resolvedConfig?.model
    });
  } catch (error) {
    console.warn('[Embeddings] Failed to attach planner widget embedding:', error.message);
    return widget;
  }

  if (!vector) {
    return widget;
  }

  widget.embedding = vector;
  widget.embeddingModel =
    getEmbeddingModelLabel(resolvedConfig) || getEmbeddingModelLabel(resolveEmbeddingConfig());
  widget.embeddingUpdatedAt = new Date();

  return widget;
};

const EMBEDDING_MODEL =
  getEmbeddingModelLabel(resolveEmbeddingConfig()) || `openai:${OPENAI_EMBEDDING_MODEL}`;

module.exports = {
  EMBEDDING_MODEL,
  resolveEmbeddingConfig,
  getEmbeddingModelLabel,
  isNoteWidgetType,
  buildPlannerWidgetEmbeddingText,
  createEmbedding,
  attachEmbeddingToPlannerWidget
};
