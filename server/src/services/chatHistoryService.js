const ChatMessage = require('../models/ChatMessage');

const MAX_CONTENT_LENGTH = 20000;

const normalizeContent = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);

const saveChatTurn = async ({
  userId,
  userMessage,
  assistantMessage,
  provider,
  model,
  mutations,
  retrieval
}) => {
  const normalizedUserMessage = normalizeContent(userMessage);
  const normalizedAssistantMessage = normalizeContent(assistantMessage);

  const docs = [];

  if (normalizedUserMessage) {
    docs.push({
      userId,
      role: 'user',
      content: normalizedUserMessage
    });
  }

  if (normalizedAssistantMessage) {
    docs.push({
      userId,
      role: 'assistant',
      content: normalizedAssistantMessage,
      provider: String(provider || ''),
      model: String(model || ''),
      metadata: {
        mutations: mutations || null,
        retrieval: retrieval || null
      }
    });
  }

  if (!docs.length) {
    return [];
  }

  try {
    return await ChatMessage.insertMany(docs, { ordered: true });
  } catch (error) {
    console.warn('[ChatHistory] Failed to save chat turn:', error.message);
    return [];
  }
};

module.exports = {
  saveChatTurn
};
