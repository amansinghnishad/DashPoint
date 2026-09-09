const mongoose = require('mongoose');

const ChatMessage = require('../models/ChatMessage');
const ChatSession = require('../models/ChatSession');

const MAX_CONTENT_LENGTH = 20000;

const normalizeContent = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);

const saveChatTurn = async ({
  userId,
  sessionId = null,
  userMessage,
  assistantMessage,
  provider,
  model,
  mutations,
  retrieval,
  routing
}) => {
  const normalizedUserMessage = normalizeContent(userMessage);
  const normalizedAssistantMessage = normalizeContent(assistantMessage);

  const docs = [];
  const validSessionId =
    sessionId && mongoose.isValidObjectId(sessionId)
      ? new mongoose.Types.ObjectId(String(sessionId))
      : null;

  if (normalizedUserMessage) {
    docs.push({
      userId,
      sessionId: validSessionId,
      role: 'user',
      content: normalizedUserMessage
    });
  }

  if (normalizedAssistantMessage) {
    docs.push({
      userId,
      sessionId: validSessionId,
      role: 'assistant',
      content: normalizedAssistantMessage,
      provider: String(provider || ''),
      model: String(model || ''),
      metadata: {
        mutations: mutations || null,
        retrieval: retrieval || null,
        routing: routing || null
      }
    });
  }

  if (!docs.length) {
    return [];
  }

  try {
    const inserted = await ChatMessage.insertMany(docs, { ordered: true });

    if (validSessionId) {
      const session = await ChatSession.findOne({ _id: validSessionId, userId });
      if (session) {
        session.lastMessageAt = new Date();
        if (
          (!session.title || session.title === 'New Conversation') &&
          normalizedUserMessage
        ) {
          session.title =
            normalizedUserMessage.length > 45
              ? `${normalizedUserMessage.slice(0, 45).trim()}...`
              : normalizedUserMessage;
        }
        await session.save();
      }
    }

    return inserted;
  } catch (error) {
    console.warn('[ChatHistory] Failed to save chat turn:', error.message);
    return [];
  }
};

const getRecentSessionMessages = async ({ userId, sessionId, limit = 12 }) => {
  if (!sessionId || !mongoose.isValidObjectId(sessionId)) return [];

  const session = await ChatSession.findOne({ _id: sessionId, userId }).select('_id').lean();
  if (!session) return [];

  return ChatMessage.find({ sessionId: session._id, userId })
    .sort({ createdAt: -1 })
    .limit(Math.min(20, Math.max(1, Number(limit) || 12)))
    .select('role content')
    .lean()
    .then((messages) => messages.reverse());
};

module.exports = {
  saveChatTurn,
  getRecentSessionMessages
};
