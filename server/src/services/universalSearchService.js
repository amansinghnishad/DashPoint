const User = require('../models/User');
const Collection = require('../models/Collection');
const File = require('../models/File');
const PlannerWidget = require('../models/PlannerWidget');
const YouTube = require('../models/YouTube');
const VideoIntelligenceChunk = require('../models/VideoIntelligenceChunk');
const ChatMessage = require('../models/ChatMessage');
const { getCalendarClient, normalizeEvent } = require('./googleCalendarService');

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;
const DEFAULT_CALENDAR_LOOKBACK_DAYS = 90;
const DEFAULT_CALENDAR_LOOKAHEAD_DAYS = 180;

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeQuery = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

const clampLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, parsed));
};

const truncate = (value, maxLength = 220) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
};

const toIso = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const buildRegex = (query) => new RegExp(escapeRegex(query), 'i');

const buildResult = ({
  type,
  id,
  title,
  subtitle = '',
  snippet = '',
  url = '',
  score = 1,
  metadata = {}
}) => ({
  type,
  id: String(id || ''),
  title: String(title || 'Untitled').trim(),
  subtitle: String(subtitle || '').trim(),
  snippet: truncate(snippet),
  url: String(url || '').trim(),
  score,
  metadata
});

const searchCollections = async ({ userId, regex, limit }) => {
  const rows = await Collection.find({
    userId,
    $or: [{ name: regex }, { description: regex }, { tags: regex }]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id name description tags itemCount items updatedAt')
    .lean();

  return rows.map((row) =>
    buildResult({
      type: 'collection',
      id: row._id,
      title: row.name,
      subtitle: 'Collection',
      snippet: row.description || `${Array.isArray(row.items) ? row.items.length : 0} items`,
      metadata: {
        collectionId: String(row._id),
        tags: row.tags || [],
        updatedAt: toIso(row.updatedAt)
      }
    })
  );
};

const searchFiles = async ({ userId, regex, limit }) => {
  const rows = await File.find({
    userId,
    $or: [
      { originalName: regex },
      { filename: regex },
      { description: regex },
      { tags: regex },
      { mimetype: regex }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id originalName filename mimetype size url description tags updatedAt')
    .lean();

  return rows.map((row) =>
    buildResult({
      type: 'file',
      id: row._id,
      title: row.originalName || row.filename,
      subtitle: row.mimetype || 'File',
      snippet: row.description || (row.tags || []).join(', '),
      url: row.url,
      metadata: {
        fileId: String(row._id),
        size: row.size,
        updatedAt: toIso(row.updatedAt)
      }
    })
  );
};

const findCollectionsForItems = async ({ userId, itemType, itemIds }) => {
  const normalizedIds = [...new Set(itemIds.map((id) => String(id || '')).filter(Boolean))];
  if (!normalizedIds.length) {
    return new Map();
  }

  const rows = await Collection.find({
    userId,
    items: {
      $elemMatch: {
        itemType,
        itemId: { $in: normalizedIds }
      }
    }
  })
    .select('_id name items')
    .lean();

  const map = new Map();
  rows.forEach((collection) => {
    (collection.items || []).forEach((item) => {
      if (item.itemType !== itemType) return;
      const itemId = String(item.itemId || '');
      if (!normalizedIds.includes(itemId) || map.has(itemId)) return;
      map.set(itemId, {
        collectionId: String(collection._id),
        collectionName: collection.name
      });
    });
  });

  return map;
};

const searchPlannerWidgets = async ({ userId, regex, limit }) => {
  const rows = await PlannerWidget.find({
    userId,
    $or: [{ title: regex }, { 'data.text': regex }, { 'data.items.text': regex }]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id widgetType title data updatedAt')
    .lean();

  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'planner',
    itemIds: rows.map((row) => row._id)
  });

  return rows.map((row) => {
    const collection = collectionMap.get(String(row._id)) || {};
    const todoSnippet = Array.isArray(row?.data?.items)
      ? row.data.items.map((item) => item?.text).filter(Boolean).join(', ')
      : '';

    return buildResult({
      type: 'planner_widget',
      id: row._id,
      title: row.title || row.widgetType,
      subtitle: collection.collectionName
        ? `Planner widget in ${collection.collectionName}`
        : 'Planner widget',
      snippet: row?.data?.text || todoSnippet,
      metadata: {
        widgetId: String(row._id),
        widgetType: row.widgetType,
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        updatedAt: toIso(row.updatedAt)
      }
    });
  });
};

const searchYouTubeVideos = async ({ userId, regex, limit }) => {
  const rows = await YouTube.find({
    userId,
    $or: [
      { title: regex },
      { channelTitle: regex },
      { description: regex },
      { tags: regex },
      { category: regex }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id videoId title channelTitle description url thumbnail duration updatedAt')
    .lean();

  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'youtube',
    itemIds: rows.map((row) => row._id)
  });

  return rows.map((row) => {
    const collection = collectionMap.get(String(row._id)) || {};

    return buildResult({
      type: 'youtube',
      id: row._id,
      title: row.title,
      subtitle: row.channelTitle || 'YouTube video',
      snippet: row.description,
      url: row.url,
      metadata: {
        youtubeId: String(row._id),
        videoId: row.videoId,
        thumbnail: row.thumbnail,
        duration: row.duration,
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        updatedAt: toIso(row.updatedAt)
      }
    });
  });
};

const searchYouTubeTranscripts = async ({ userId, regex, limit }) => {
  const chunks = await VideoIntelligenceChunk.find({
    userId,
    text: regex
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id youtubeId videoId text startSec durationSec updatedAt')
    .lean();

  const youtubeIds = [...new Set(chunks.map((chunk) => String(chunk.youtubeId)))];
  const videos = youtubeIds.length
    ? await YouTube.find({ _id: { $in: youtubeIds }, userId })
        .select('_id title url thumbnail')
        .lean()
    : [];
  const videoMap = new Map(videos.map((video) => [String(video._id), video]));

  return chunks.map((chunk) => {
    const video = videoMap.get(String(chunk.youtubeId));

    return buildResult({
      type: 'youtube_transcript',
      id: chunk._id,
      title: video?.title || `Transcript ${chunk.videoId}`,
      subtitle: `Transcript at ${Math.round(Number(chunk.startSec || 0))}s`,
      snippet: chunk.text,
      url: video?.url || '',
      metadata: {
        youtubeId: String(chunk.youtubeId),
        videoId: chunk.videoId,
        transcriptChunkId: String(chunk._id),
        startSec: Number(chunk.startSec) || 0,
        durationSec: Number(chunk.durationSec) || 0,
        thumbnail: video?.thumbnail || '',
        updatedAt: toIso(chunk.updatedAt)
      }
    });
  });
};

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

const searchCalendarEvents = async ({ userId, query, limit }) => {
  let user;
  try {
    user = await User.findById(userId).select(
      '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId'
    );
  } catch (error) {
    return {
      results: [],
      warning: error.message
    };
  }

  if (!user?.googleCalendar?.connected || !user?.googleCalendar?.refreshToken) {
    return {
      results: [],
      warning: 'Google Calendar is not connected'
    };
  }

  try {
    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });

    const now = Date.now();
    const timeMin = new Date(now - DEFAULT_CALENDAR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const timeMax = new Date(now + DEFAULT_CALENDAR_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
    const calendarId = user.googleCalendar.calendarId || 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      q: query
    });

    const normalized = (response?.data?.items || []).map(normalizeEvent).slice(0, limit);

    return {
      results: normalized.map((event) =>
        buildResult({
          type: 'calendar_event',
          id: event.id,
          title: event.summary,
          subtitle: event.start || 'Calendar event',
          snippet: [event.description, event.location].filter(Boolean).join(' '),
          url: event.htmlLink,
          metadata: {
            eventId: event.id,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            status: event.status
          }
        })
      ),
      warning: ''
    };
  } catch (error) {
    return {
      results: [],
      warning: error.message
    };
  }
};

const searchAll = async ({ userId, query, limit = DEFAULT_LIMIT }) => {
  const normalizedQuery = normalizeQuery(query);
  const perTypeLimit = clampLimit(limit);

  if (normalizedQuery.length < 2) {
    return {
      query: normalizedQuery,
      total: 0,
      groups: [],
      warnings: []
    };
  }

  const regex = buildRegex(normalizedQuery);

  const [
    collections,
    files,
    plannerWidgets,
    youtubeVideos,
    youtubeTranscripts,
    chatHistory,
    calendar
  ] = await Promise.all([
    searchCollections({ userId, regex, limit: perTypeLimit }),
    searchFiles({ userId, regex, limit: perTypeLimit }),
    searchPlannerWidgets({ userId, regex, limit: perTypeLimit }),
    searchYouTubeVideos({ userId, regex, limit: perTypeLimit }),
    searchYouTubeTranscripts({ userId, regex, limit: perTypeLimit }),
    searchChatHistory({ userId, regex, limit: perTypeLimit }),
    searchCalendarEvents({ userId, query: normalizedQuery, limit: perTypeLimit })
  ]);

  const groupDefs = [
    ['collections', 'Collections', collections],
    ['files', 'Files', files],
    ['planner_widgets', 'Planner widgets', plannerWidgets],
    ['youtube', 'YouTube videos', youtubeVideos],
    ['youtube_transcripts', 'YouTube transcripts', youtubeTranscripts],
    ['calendar_events', 'Calendar events', calendar.results],
    ['chat_history', 'Chat history', chatHistory]
  ];

  const groups = groupDefs
    .map(([type, label, results]) => ({
      type,
      label,
      count: results.length,
      results
    }))
    .filter((group) => group.count > 0);

  return {
    query: normalizedQuery,
    total: groups.reduce((sum, group) => sum + group.count, 0),
    groups,
    warnings: [calendar.warning].filter(Boolean)
  };
};

module.exports = {
  searchAll
};
