const OpenAI = require('openai');

const NOTE_WIDGET_TYPES = ['notes', 'notes-tomorrow'];
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

let client = null;

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
};

const isNoteWidgetType = (widgetType) =>
  NOTE_WIDGET_TYPES.includes(String(widgetType || '').trim());

const buildPlannerWidgetEmbeddingText = ({ title, data }) => {
  const noteText = typeof data?.text === 'string' ? data.text : '';
  const heading = String(title || '').trim();
  const body = String(noteText || '').trim();

  return [heading, body].filter(Boolean).join('\n\n').trim();
};

const createEmbedding = async (text) => {
  const openai = getClient();
  if (!openai) {
    return null;
  }

  const normalized = String(text || '').trim();
  if (!normalized) {
    return null;
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalized.slice(0, 12000)
  });

  return response?.data?.[0]?.embedding || null;
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

  const vector = await createEmbedding(inputText);
  if (!vector) {
    return widget;
  }

  widget.embedding = vector;
  widget.embeddingModel = EMBEDDING_MODEL;
  widget.embeddingUpdatedAt = new Date();

  return widget;
};

module.exports = {
  EMBEDDING_MODEL,
  isNoteWidgetType,
  buildPlannerWidgetEmbeddingText,
  createEmbedding,
  attachEmbeddingToPlannerWidget
};
