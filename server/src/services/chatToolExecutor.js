const axios = require('axios');
const mongoose = require('mongoose');

const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');
const YouTube = require('../models/YouTube');
const VideoIntelligenceChunk = require('../models/VideoIntelligenceChunk');
const {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
} = require('./actionItemExtractionService');
const {
  getAssistantMemoryForUser,
  updateAssistantMemoryForUser
} = require('./assistantMemoryService');
const {
  createInsightForYouTube,
  serializeInsight
} = require('./contentInsightService');
const { attachEmbeddingToPlannerWidget } = require('./embeddingsService');
const { retrieveChatContext } = require('./chatContextService');
const { indexTranscriptForVideo } = require('./youtubeTranscriptService');
const {
  getGoogleCalendarStatusTool,
  getGoogleCalendarAuthUrlTool,
  listGoogleCalendarEventsTool,
  createGoogleCalendarEventTool,
  scheduleGoogleCalendarBlockTool
} = require('./chatCalendarToolService');

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDuration = (durationValue) => {
  const raw = String(durationValue || '').trim();
  const match = raw.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    return '';
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const normalizeCollectionName = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+collection$/i, '')
    .trim();

const normalizeText = (value, maxLength = 8000) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const extractVideoId = (input) => {
  const raw = String(input || '').trim();
  if (!raw) {
    return '';
  }

  if (YOUTUBE_ID_PATTERN.test(raw)) {
    return raw;
  }

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return '';
};

const getYouTubeApiKey = () => {
  const apiKey = String(process.env.YOUTUBE_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  return apiKey;
};

const resolveCollectionForUser = async (userId, args = {}) => {
  const collectionId = String(args.collectionId || '').trim();
  if (collectionId) {
    if (!mongoose.isValidObjectId(collectionId)) {
      throw new Error('collectionId must be a valid MongoDB id');
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  const normalizedName = normalizeCollectionName(args.collectionName);
  if (!normalizedName) {
    throw new Error('Provide collectionId or collectionName');
  }

  const exact = await Collection.findOne({
    userId,
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' }
  });
  if (exact) {
    return exact;
  }

  const partial = await Collection.findOne({
    userId,
    name: { $regex: escapeRegex(normalizedName), $options: 'i' }
  }).sort({ createdAt: -1 });

  if (partial) {
    return partial;
  }

  throw new Error(`Collection "${normalizedName}" not found`);
};

const searchVideoIdByQuery = async (query) => {
  const searchQuery = String(query || '').trim();
  if (!searchQuery) {
    throw new Error('searchQuery is required when youtubeUrl/videoId is missing');
  }

  const apiKey = getYouTubeApiKey();
  const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
    params: {
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: 1,
      order: 'relevance',
      key: apiKey
    },
    timeout: 20000
  });

  const videoId = String(response?.data?.items?.[0]?.id?.videoId || '').trim();
  if (!videoId) {
    throw new Error(`No YouTube results found for query: "${searchQuery}"`);
  }

  return videoId;
};

const fetchYouTubeVideoDetails = async (videoId) => {
  const resolvedVideoId = String(videoId || '').trim();
  if (!YOUTUBE_ID_PATTERN.test(resolvedVideoId)) {
    throw new Error('Invalid YouTube video id');
  }

  const apiKey = getYouTubeApiKey();
  const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: resolvedVideoId,
      key: apiKey
    },
    timeout: 20000
  });

  const item = response?.data?.items?.[0];
  if (!item) {
    throw new Error('YouTube video not found');
  }

  const thumbnails = item?.snippet?.thumbnails || {};
  const thumbnailUrl =
    thumbnails.maxres?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    `https://img.youtube.com/vi/${resolvedVideoId}/hqdefault.jpg`;

  return {
    videoId: resolvedVideoId,
    title: String(item?.snippet?.title || `YouTube: ${resolvedVideoId}`)
      .trim()
      .slice(0, 200),
    description: String(item?.snippet?.description || '')
      .trim()
      .slice(0, 1000),
    channelTitle: String(item?.snippet?.channelTitle || '')
      .trim()
      .slice(0, 100),
    thumbnail: thumbnailUrl,
    url: `https://www.youtube.com/watch?v=${resolvedVideoId}`,
    embedUrl: `https://www.youtube.com/embed/${resolvedVideoId}`,
    duration: parseDuration(item?.contentDetails?.duration),
    viewCount: Number.parseInt(item?.statistics?.viewCount || '0', 10) || 0
  };
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  const cleaned = tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .slice(0, 20);

  return [...new Set(cleaned)];
};

const createCollectionForUser = async (userId, args) => {
  const name = String(args?.name || '').trim();
  if (!name) {
    throw new Error('Collection name is required');
  }

  const existing = await Collection.findOne({ userId, name });
  if (existing) {
    return {
      created: false,
      message: 'Collection with this name already exists',
      collection: {
        _id: String(existing._id),
        name: existing.name
      }
    };
  }

  const collection = new Collection({
    userId,
    name,
    description: args?.description,
    color: args?.color,
    icon: args?.icon,
    tags: normalizeTags(args?.tags),
    isPrivate: args?.isPrivate !== undefined ? Boolean(args.isPrivate) : true
  });

  await collection.save();

  return {
    created: true,
    message: 'Collection created successfully',
    collection: {
      _id: String(collection._id),
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
      icon: collection.icon,
      tags: collection.tags,
      isPrivate: collection.isPrivate
    }
  };
};

const addNoteToCollection = async (userId, args) => {
  const collectionId = String(args?.collectionId || '').trim();
  const noteText = String(args?.note || '').trim();
  const rawTitle = String(args?.title || '').trim();

  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  if (!noteText) {
    throw new Error('Note text is required');
  }

  const collection = await Collection.findOne({ _id: collectionId, userId });
  if (!collection) {
    throw new Error('Collection not found');
  }

  const widget = new PlannerWidget({
    userId,
    widgetType: 'notes',
    title: rawTitle.slice(0, 100),
    data: {
      text: noteText
    }
  });

  await attachEmbeddingToPlannerWidget(widget);
  await widget.save();
  await collection.addItem('planner', String(widget._id));

  return {
    added: true,
    message: 'Note added to collection',
    collection: {
      _id: String(collection._id),
      name: collection.name
    },
    widget: {
      _id: String(widget._id),
      widgetType: widget.widgetType,
      title: widget.title,
      data: widget.data
    }
  };
};

const createCollectionWithNote = async (userId, args) => {
  const name = String(args?.name || '').trim();
  const noteText = String(args?.note || '').trim();

  if (!name) {
    throw new Error('Collection name is required');
  }

  if (!noteText) {
    throw new Error('Note text is required');
  }

  let collection = await Collection.findOne({ userId, name });
  let created = false;

  if (!collection) {
    collection = new Collection({
      userId,
      name,
      description: args?.description,
      color: args?.color,
      icon: args?.icon,
      tags: normalizeTags(args?.tags),
      isPrivate: args?.isPrivate !== undefined ? Boolean(args.isPrivate) : true
    });
    await collection.save();
    created = true;
  }

  const widget = new PlannerWidget({
    userId,
    widgetType: 'notes',
    title: String(args?.title || '').trim().slice(0, 100),
    data: {
      text: noteText
    }
  });

  await attachEmbeddingToPlannerWidget(widget);
  await widget.save();
  await collection.addItem('planner', String(widget._id));

  return {
    success: true,
    message: created
      ? 'Collection created and note added successfully'
      : 'Collection found and note added successfully',
    collection: {
      _id: String(collection._id),
      name: collection.name,
      created
    },
    widget: {
      _id: String(widget._id),
      widgetType: widget.widgetType,
      title: widget.title,
      data: widget.data
    }
  };
};

const ensureWorkflowCollection = async (userId, args = {}) => {
  const collectionId = String(args?.collectionId || '').trim();
  if (collectionId) {
    if (!mongoose.isValidObjectId(collectionId)) {
      throw new Error('collectionId must be a valid MongoDB id');
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  const normalizedName =
    normalizeCollectionName(args?.collectionName) || 'AI Learning Workflows';
  const existing = await Collection.findOne({
    userId,
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' }
  });

  if (existing) {
    return existing;
  }

  const collection = new Collection({
    userId,
    name: normalizedName,
    description: 'AI-generated learning workflows, summaries, and action items',
    color: '#3B82F6',
    icon: 'Sparkles',
    tags: ['ai', 'workflow'],
    isPrivate: true
  });

  await collection.save();
  return collection;
};

const addYouTubeVideoToCollection = async (userId, args) => {
  const collection = await resolveCollectionForUser(userId, args);
  const explicitVideoId =
    extractVideoId(args?.videoId) || extractVideoId(args?.youtubeUrl);
  const resolvedVideoId = explicitVideoId || (await searchVideoIdByQuery(args?.searchQuery));

  const details = await fetchYouTubeVideoDetails(resolvedVideoId);

  let video = await YouTube.findOne({
    userId,
    videoId: details.videoId
  });

  const hasExplicitCategory = String(args?.category || '').trim();
  const hasFavoriteFlag = typeof args?.isFavorite === 'boolean';

  if (!video) {
    video = new YouTube({
      userId,
      ...details,
      category: hasExplicitCategory ? hasExplicitCategory.slice(0, 50) : 'general',
      isFavorite: hasFavoriteFlag ? args.isFavorite : false
    });
  } else {
    video.title = details.title;
    video.description = details.description;
    video.thumbnail = details.thumbnail;
    video.url = details.url;
    video.embedUrl = details.embedUrl;
    video.duration = details.duration;
    video.channelTitle = details.channelTitle;
    video.viewCount = details.viewCount;
    if (hasExplicitCategory) {
      video.category = hasExplicitCategory.slice(0, 50);
    }
    if (hasFavoriteFlag) {
      video.isFavorite = args.isFavorite;
    }
  }

  await video.save();

  const videoIdInCollection = String(video._id);
  const alreadyInCollection = collection.items.some(
    (item) => item.itemType === 'youtube' && String(item.itemId) === videoIdInCollection
  );

  if (!alreadyInCollection) {
    await collection.addItem('youtube', videoIdInCollection);
  }

  const transcriptIndexing = await indexTranscriptForVideo(video);
  let insight = null;
  try {
    insight = await createInsightForYouTube({
      userId,
      video
    });
  } catch (error) {
    console.warn('[ChatTool] Automatic YouTube insight extraction failed:', error.message);
  }

  return {
    success: true,
    collection: {
      _id: String(collection._id),
      name: collection.name
    },
    video: {
      _id: String(video._id),
      videoId: video.videoId,
      title: video.title,
      url: video.url,
      transcriptStatus: video.transcriptStatus,
      transcriptChunkCount: Number(video.transcriptChunkCount || 0),
      transcriptIndexedAt: video.transcriptIndexedAt,
      transcriptError: video.transcriptError
    },
    addedToCollection: !alreadyInCollection,
    transcriptIndexing,
    insight: serializeInsight(insight)
  };
};

const getTranscriptSourceForVideo = async ({ userId, video, collectionId, prompt }) => {
  const query = normalizeText(
    prompt || `Summarize ${video?.title || 'this video'} and extract action items`,
    500
  );

  const retrieval = await retrieveChatContext({
    userId,
    query,
    topK: 8,
    collectionIds: collectionId ? [collectionId] : [],
    embeddingProviders: []
  });

  const retrievalText = normalizeText(retrieval?.contextText, 12000);
  if (retrievalText) {
    return {
      sourceText: retrievalText,
      source: 'rag',
      retrieval: {
        hitCount: retrieval.items.length,
        sources: retrieval.items.map((item) => ({
          contextId: item.contextId,
          sourceType: item.sourceType,
          sourceLabel: item.sourceLabel,
          score: item.score
        }))
      }
    };
  }

  const chunks = await VideoIntelligenceChunk.find({
    userId,
    youtubeId: video._id
  })
    .sort({ chunkIndex: 1 })
    .limit(16)
    .select('text chunkIndex startSec durationSec')
    .lean();

  const chunkText = normalizeText(
    chunks.map((chunk) => chunk.text).filter(Boolean).join('\n\n'),
    12000
  );

  if (chunkText) {
    return {
      sourceText: chunkText,
      source: 'transcript_chunks',
      retrieval: {
        hitCount: chunks.length,
        sources: chunks.map((chunk, index) => ({
          contextId: `T${index + 1}`,
          sourceType: 'youtube_transcript',
          sourceLabel: video.title,
          startSec: Number(chunk.startSec) || 0,
          durationSec: Number(chunk.durationSec) || 0
        }))
      }
    };
  }

  const fallbackText = normalizeText(
    [video.title, video.channelTitle, video.description].filter(Boolean).join('\n\n'),
    5000
  );

  return {
    sourceText: fallbackText,
    source: fallbackText ? 'video_metadata' : 'none',
    retrieval: {
      hitCount: fallbackText ? 1 : 0,
      sources: fallbackText
        ? [
            {
              contextId: 'M1',
              sourceType: 'youtube_metadata',
              sourceLabel: video.title
            }
          ]
        : []
    }
  };
};

const createTodoWidgetFromSuggestions = async ({
  userId,
  collection,
  title,
  suggestions
}) => {
  const todoItems = mapSuggestionsToTodoItems(suggestions);
  if (!todoItems.length) {
    return null;
  }

  const widget = new PlannerWidget({
    userId,
    widgetType: 'todo-list',
    title: normalizeText(title || 'Video action items', 100),
    data: {
      items: todoItems,
      source: 'youtube_learning_workflow'
    }
  });

  await attachEmbeddingToPlannerWidget(widget);
  await widget.save();
  await collection.addItem('planner', String(widget._id));

  return {
    _id: String(widget._id),
    widgetType: widget.widgetType,
    title: widget.title,
    data: widget.data
  };
};

const runYouTubeLearningWorkflow = async (userId, args = {}) => {
  const collection = await ensureWorkflowCollection(userId, args);
  const savedVideo = await addYouTubeVideoToCollection(userId, {
    ...args,
    collectionId: String(collection._id)
  });

  const video = await YouTube.findOne({
    _id: savedVideo?.video?._id,
    userId
  });

  if (!video) {
    throw new Error('Saved YouTube video could not be loaded');
  }

  const transcriptSource = await getTranscriptSourceForVideo({
    userId,
    video,
    collectionId: String(collection._id),
    prompt: args?.goal || args?.summaryPrompt || args?.searchQuery
  });

  const extraction = await extractActionItemsFromText({
    rawText: transcriptSource.sourceText,
    maxItems: args?.maxActionItems
  });

  const widget = await createTodoWidgetFromSuggestions({
    userId,
    collection,
    title: args?.todoTitle || `Action items: ${video.title}`,
    suggestions: extraction.suggestions
  });

  let schedule = null;
  if (args?.createScheduleBlock) {
    try {
      schedule = await scheduleGoogleCalendarBlockTool(userId, {
        summary: args?.scheduleTitle || `Work on: ${video.title}`,
        description:
          args?.scheduleDescription ||
          `DashPoint workflow generated from ${video.url}\n\nAction items:\n${extraction.suggestions
            .map((item) => `- ${item.text}`)
            .join('\n')}`,
        durationMinutes: args?.durationMinutes,
        timeMin: args?.timeMin,
        timeMax: args?.timeMax,
        timezone: args?.timezone,
        conflictStrategy: args?.conflictStrategy,
        minSessionMinutes: args?.minSessionMinutes,
        maxSplitParts: args?.maxSplitParts,
        allowLightPractice: args?.allowLightPractice,
        createEvents: true,
        colorId: args?.colorId,
        dashpointType: 'youtube-learning-workflow',
        dashpointColor: args?.dashpointColor || 'info'
      });
    } catch (error) {
      schedule = {
        ok: false,
        error: error.message
      };
    }
  }

  return {
    message: 'YouTube learning workflow completed',
    collection: {
      _id: String(collection._id),
      name: collection.name
    },
    video: savedVideo.video,
    transcript: {
      status: video.transcriptStatus,
      source: transcriptSource.source,
      contextExcerpt: normalizeText(transcriptSource.sourceText, 8000),
      retrieval: transcriptSource.retrieval
    },
    actionItems: {
      suggestions: extraction.suggestions,
      meta: extraction.meta,
      widget
    },
    schedule
  };
};

const executeToolCall = async ({ name, args, userId }) => {
  switch (name) {
    case 'getAssistantMemory':
      return getAssistantMemoryForUser(userId);
    case 'updateAssistantMemory':
      return updateAssistantMemoryForUser(userId, args);
    case 'createCollection':
      return createCollectionForUser(userId, args);
    case 'addNote':
      return addNoteToCollection(userId, args);
    case 'createCollectionWithNote':
      return createCollectionWithNote(userId, args);
    case 'addYouTubeVideoToCollection':
      return addYouTubeVideoToCollection(userId, args);
    case 'runYouTubeLearningWorkflow':
      return runYouTubeLearningWorkflow(userId, args);
    case 'getGoogleCalendarStatus':
      return getGoogleCalendarStatusTool(userId, args);
    case 'getGoogleCalendarAuthUrl':
      return getGoogleCalendarAuthUrlTool(userId, args);
    case 'listGoogleCalendarEvents':
      return listGoogleCalendarEventsTool(userId, args);
    case 'createGoogleCalendarEvent':
      return createGoogleCalendarEventTool(userId, args);
    case 'scheduleGoogleCalendarBlock':
      return scheduleGoogleCalendarBlockTool(userId, args);
    default:
      throw new Error(`Unsupported tool: ${name}`);
  }
};

module.exports = {
  executeToolCall
};
