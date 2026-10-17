const ChatMessage = require('../../../../models/ChatMessage');
const { buildResult, toIso } = require('../searchResultUtils');

const searchChatHistory = async ({ userId, regex, limit }) => {
  const rows = await ChatMessage.find({
    userId,
    content: regex
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('_id role content provider model createdAt')
    .lean();

  return rows.map((row) =>
    buildResult({
      type: 'chat_message',
      id: row._id,
      title: row.role === 'user' ? 'You asked' : 'Assistant answered',
      subtitle: row.role === 'assistant' ? [row.provider, row.model].filter(Boolean).join(' / ') : 'Chat history',
      snippet: row.content,
      metadata: {
        messageId: String(row._id),
        role: row.role,
        provider: row.provider || '',
        model: row.model || '',
        createdAt: toIso(row.createdAt)
      }
    })
  );
};

module.exports = {
  searchChatHistory
};
