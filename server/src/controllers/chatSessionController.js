const mongoose = require('mongoose');

const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

exports.listSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { includeArchived } = req.query;

    // Older chat messages may predate ChatSession. Move them into one
    // recoverable legacy session so they remain visible and resumable.
    const legacyMessages = await ChatMessage.findOne({ userId, sessionId: null })
      .select('_id createdAt')
      .sort({ createdAt: 1 })
      .lean();

    if (legacyMessages) {
      let legacySession = await ChatSession.findOne({
        userId,
        title: 'Imported conversation'
      });

      if (!legacySession) {
        const latestLegacyMessage = await ChatMessage.findOne({ userId, sessionId: null })
          .select('createdAt')
          .sort({ createdAt: -1 })
          .lean();

        legacySession = await ChatSession.create({
          userId,
          title: 'Imported conversation',
          provider: 'auto',
          model: 'auto',
          lastMessageAt: latestLegacyMessage?.createdAt || legacyMessages.createdAt || new Date()
        });
      }

      await ChatMessage.updateMany(
        { userId, sessionId: null },
        { $set: { sessionId: legacySession._id } }
      );
    }

    const filter = { userId };
    if (includeArchived !== 'true') {
      filter.isArchived = false;
    }

    const sessions = await ChatSession.find(filter)
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach message counts
    const sessionIds = sessions.map((s) => s._id);
    const messageCounts = await ChatMessage.aggregate([
      { $match: { sessionId: { $in: sessionIds }, userId } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map(messageCounts.map((m) => [String(m._id), m.count]));

    const data = sessions.map((session) => ({
      ...session,
      messageCount: countMap.get(String(session._id)) || 0
    }));

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, provider, model } = req.body;

    const session = new ChatSession({
      userId,
      title: String(title || 'New Conversation').trim().slice(0, 120),
      provider: String(provider || 'auto').trim(),
      model: String(model || 'auto').trim()
    });

    await session.save();

    return res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID'
      });
    }

    const session = await ChatSession.findOne({ _id: sessionId, userId }).lean();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const messages = await ChatMessage.find({ sessionId, userId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        session,
        messages
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { title, isArchived } = req.body;

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID'
      });
    }

    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (typeof title === 'string' && title.trim()) {
      session.title = title.trim().slice(0, 120);
    }

    if (typeof isArchived === 'boolean') {
      session.isArchived = isArchived;
    }

    await session.save();

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID'
      });
    }

    const session = await ChatSession.findOneAndDelete({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await ChatMessage.deleteMany({ sessionId, userId });

    return res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};
