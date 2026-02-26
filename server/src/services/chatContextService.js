const mongoose = require('mongoose');

const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');
const YouTube = require('../models/YouTube');
const VideoIntelligenceChunk = require('../models/VideoIntelligenceChunk');
const { createEmbedding } = require('./embeddingsService');
const { runAtlasVectorSearch } = require('./vectorSearchService');

const DEFAULT_TOP_K = 3;
const MAX_TOP_K = 8;
const MAX_CONTEXT_CHARS = 900;
const NUM_CANDIDATES = 120;
const PLANNER_WIDGET_VECTOR_INDEX =
  process.env.PLANNER_WIDGET_VECTOR_INDEX || 'planner_widget_embedding_idx';
const YOUTUBE_TRANSCRIPT_VECTOR_INDEX =
  process.env.VIDEO_INTELLIGENCE_VECTOR_INDEX ||
  process.env.YOUTUBE_TRANSCRIPT_VECTOR_INDEX ||
  'video_intelligence_embedding_idx';

const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  return new mongoose.Types.ObjectId(String(value));
};

const clampTopK = (topK) => {
  const parsed = Number.parseInt(topK, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TOP_K;
  }

  return Math.max(1, Math.min(parsed, MAX_TOP_K));
};

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const truncateText = (value, limit = MAX_CONTEXT_CHARS) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
};

const normalizeCollectionIds = (collectionIds = []) => [
  ...new Set(
    (Array.isArray(collectionIds) ? collectionIds : [])
      .map((id) => String(id || '').trim())
      .filter((id) => mongoose.isValidObjectId(id))
  )
];

const buildCollectionScope = async ({ userObjectId, collectionIds = [] }) => {
  const normalizedCollectionIds = normalizeCollectionIds(collectionIds);
  if (!normalizedCollectionIds.length) {
    return {
      mode: 'all',
      requestedCollectionIds: [],
      appliedCollectionIds: [],
      appliedCollectionNames: [],
      plannerWidgetIds: null,
      youtubeIds: null
    };
  }

  const collections = await Collection.find({
    _id: { $in: normalizedCollectionIds.map((id) => new mongoose.Types.ObjectId(id)) },
    userId: userObjectId
  })
    .select('_id name items')
    .lean();

  const plannerWidgetIds = new Set();
  const youtubeIds = new Set();

  collections.forEach((collection) => {
    const items = Array.isArray(collection?.items) ? collection.items : [];

    items.forEach((item) => {
      const itemId = String(item?.itemId || '').trim();
      if (!mongoose.isValidObjectId(itemId)) {
        return;
      }

      if (item?.itemType === 'planner') {
        plannerWidgetIds.add(itemId);
        return;
      }

      if (item?.itemType === 'youtube') {
        youtubeIds.add(itemId);
      }
    });
  });

  return {
    mode: 'collections',
    requestedCollectionIds: normalizedCollectionIds,
    appliedCollectionIds: collections.map((collection) => String(collection._id)),
    appliedCollectionNames: collections
      .map((collection) => String(collection?.name || '').trim())
      .filter(Boolean),
    plannerWidgetIds: [...plannerWidgetIds],
    youtubeIds: [...youtubeIds]
  };
};

const searchPlannerNoteContext = async ({
  userObjectId,
  queryVector,
  limit,
  allowedPlannerWidgetIds = null
}) => {
  if (Array.isArray(allowedPlannerWidgetIds) && !allowedPlannerWidgetIds.length) {
    return [];
  }

  const filter = {
    userId: userObjectId
  };

  if (Array.isArray(allowedPlannerWidgetIds)) {
    filter._id = {
      $in: allowedPlannerWidgetIds.map((id) => new mongoose.Types.ObjectId(id))
    };
  }

  try {
    const rows = await runAtlasVectorSearch({
      model: PlannerWidget,
      indexName: PLANNER_WIDGET_VECTOR_INDEX,
      queryVector,
      limit,
      numCandidates: NUM_CANDIDATES,
      filter,
      project: {
        _id: 1,
        widgetType: 1,
        title: 1,
        data: 1,
        updatedAt: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    });

    return rows
      .map((row) => {
        const body = typeof row?.data?.text === 'string' ? row.data.text : '';
        const content = [String(row?.title || '').trim(), body].filter(Boolean).join('\n\n');

        return {
          sourceType: 'planner_note',
          sourceId: String(row?._id || ''),
          sourceLabel: String(row?.title || '').trim() || 'Planner note',
          content: truncateText(content),
          score: Number(row?.score) || 0
        };
      })
      .filter((row) => row.sourceId && row.content);
  } catch (error) {
    console.warn('[RAG] Planner note vector search failed:', error.message);
    return [];
  }
};

const searchYouTubeContext = async ({
  userObjectId,
  queryVector,
  limit,
  allowedYoutubeIds = null
}) => {
  if (Array.isArray(allowedYoutubeIds) && !allowedYoutubeIds.length) {
    return [];
  }

  const filter = {
    userId: userObjectId
  };

  if (Array.isArray(allowedYoutubeIds)) {
    filter.youtubeId = {
      $in: allowedYoutubeIds.map((id) => new mongoose.Types.ObjectId(id))
    };
  }

  try {
    const rows = await runAtlasVectorSearch({
      model: VideoIntelligenceChunk,
      indexName: YOUTUBE_TRANSCRIPT_VECTOR_INDEX,
      queryVector,
      limit,
      numCandidates: NUM_CANDIDATES,
      filter,
      project: {
        _id: 1,
        youtubeId: 1,
        text: 1,
        startSec: 1,
        durationSec: 1,
        sourceLanguage: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    });

    const youtubeIds = [
      ...new Set(rows.map((row) => String(row?.youtubeId || '')).filter(Boolean))
    ];

    let titleMap = new Map();
    if (youtubeIds.length) {
      const videos = await YouTube.find({
        _id: { $in: youtubeIds.map((id) => new mongoose.Types.ObjectId(id)) },
        userId: userObjectId
      })
        .select('_id title')
        .lean();

      titleMap = new Map(videos.map((video) => [String(video._id), video.title]));
    }

    return rows
      .map((row) => {
        const youtubeId = String(row?.youtubeId || '');
        const label = titleMap.get(youtubeId) || 'YouTube transcript';

        return {
          sourceType: 'youtube_transcript',
          sourceId: String(row?._id || ''),
          sourceLabel: label,
          content: truncateText(row?.text),
          score: Number(row?.score) || 0,
          metadata: {
            youtubeId,
            startSec: Number(row?.startSec) || 0,
            durationSec: Number(row?.durationSec) || 0,
            sourceLanguage: String(row?.sourceLanguage || '')
          }
        };
      })
      .filter((row) => row.sourceId && row.content);
  } catch (error) {
    console.warn('[RAG] YouTube transcript vector search failed:', error.message);
    return [];
  }
};

const formatContextText = (items) =>
  items
    .map((item, index) => {
      const contextId = `C${index + 1}`;
      const metadataText =
        item.sourceType === 'youtube_transcript'
          ? ` | t=${Number(item?.metadata?.startSec || 0).toFixed(1)}s`
          : '';

      return `[${contextId}] Source: ${item.sourceLabel} (${item.sourceType}${metadataText})\n${item.content}`;
    })
    .join('\n\n');

const normalizeEmbeddingProviders = (providers = []) => {
  const input = Array.isArray(providers) ? providers : [providers];
  const normalized = input
    .map((provider) => String(provider || '').trim().toLowerCase())
    .filter((provider) => provider === 'openai' || provider === 'gemini');

  return [...new Set(normalized)];
};

const createQueryEmbeddingWithFallback = async ({ query, embeddingProviders = [] }) => {
  const normalizedProviders = normalizeEmbeddingProviders(embeddingProviders);
  const providerOrder = normalizedProviders.length ? normalizedProviders : ['openai', 'gemini'];

  for (const provider of providerOrder) {
    try {
      const vector = await createEmbedding(query, {
        taskType: 'RETRIEVAL_QUERY',
        provider
      });

      if (Array.isArray(vector) && vector.length) {
        return {
          vector,
          provider
        };
      }
    } catch (error) {
      console.warn(
        `[RAG] Query embedding failed for provider "${provider}": ${error.message}`
      );
    }
  }

  return {
    vector: null,
    provider: null
  };
};

const retrieveChatContext = async ({
  userId,
  query,
  topK = DEFAULT_TOP_K,
  collectionIds = [],
  embeddingProviders = []
}) => {
  const normalizedQuery = normalizeText(query);
  const resolvedTopK = clampTopK(topK);
  const userObjectId = toObjectId(userId);
  const scope = await buildCollectionScope({
    userObjectId,
    collectionIds
  });

  if (!normalizedQuery) {
    return {
      topK: resolvedTopK,
      items: [],
      contextText: '',
      embeddingProvider: null,
      scope: {
        mode: scope.mode,
        requestedCollectionIds: scope.requestedCollectionIds,
        appliedCollectionIds: scope.appliedCollectionIds,
        appliedCollectionNames: scope.appliedCollectionNames
      }
    };
  }

  const queryEmbedding = await createQueryEmbeddingWithFallback({
    query: normalizedQuery,
    embeddingProviders
  });
  const queryVector = queryEmbedding.vector;

  if (!Array.isArray(queryVector) || !queryVector.length) {
    return {
      topK: resolvedTopK,
      items: [],
      contextText: '',
      scope: {
        mode: scope.mode,
        requestedCollectionIds: scope.requestedCollectionIds,
        appliedCollectionIds: scope.appliedCollectionIds,
        appliedCollectionNames: scope.appliedCollectionNames
      },
      embeddingProvider: null
    };
  }

  const perSourceLimit = Math.max(resolvedTopK, 4);

  const [plannerHits, youtubeHits] = await Promise.all([
    searchPlannerNoteContext({
      userObjectId,
      queryVector,
      limit: perSourceLimit,
      allowedPlannerWidgetIds: scope.plannerWidgetIds
    }),
    searchYouTubeContext({
      userObjectId,
      queryVector,
      limit: perSourceLimit,
      allowedYoutubeIds: scope.youtubeIds
    })
  ]);

  const merged = [...plannerHits, ...youtubeHits]
    .sort((a, b) => b.score - a.score)
    .slice(0, resolvedTopK)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      contextId: `C${index + 1}`
    }));

  return {
    topK: resolvedTopK,
    items: merged,
    contextText: formatContextText(merged),
    embeddingProvider: queryEmbedding.provider,
    scope: {
      mode: scope.mode,
      requestedCollectionIds: scope.requestedCollectionIds,
      appliedCollectionIds: scope.appliedCollectionIds,
      appliedCollectionNames: scope.appliedCollectionNames
    }
  };
};

module.exports = {
  DEFAULT_TOP_K,
  retrieveChatContext
};
