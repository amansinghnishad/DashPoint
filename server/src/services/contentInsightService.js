const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const Collection = require('../models/Collection');
const ContentInsight = require('../models/ContentInsight');
const PlannerWidget = require('../models/PlannerWidget');
const VideoIntelligenceChunk = require('../models/VideoIntelligenceChunk');
const { attachEmbeddingToPlannerWidget } = require('./embeddingsService');

const INSIGHT_MODEL =
  process.env.CONTENT_INSIGHT_MODEL ||
  process.env.ACTION_ITEM_EXTRACTION_MODEL ||
  process.env.OPENAI_MODEL ||
  'gpt-4.1-mini';
const MAX_SOURCE_CHARS = 18000;
const MAX_SUMMARY_CHARS = 2000;
const MAX_TASKS = 12;
const MAX_KEY_POINTS = 8;
const MAX_DEADLINES = 8;
const MAX_ENTITIES = 12;

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

const normalizeText = (value, maxLength = 500) =>
  String(value || '')
    .replace(/\u0000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const normalizePriority = (value) => {
  const normalized = normalizeText(value, 20).toLowerCase();
  return ['low', 'medium', 'high'].includes(normalized) ? normalized : 'medium';
};

const normalizeArray = (values, maxItems, maxLength) => {
  const seen = new Set();
  const output = [];

  for (const value of Array.isArray(values) ? values : []) {
    const normalized = normalizeText(value, maxLength);
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);

    if (output.length >= maxItems) break;
  }

  return output;
};

const parseJsonPayload = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const normalizeInsightPayload = (payload = {}) => ({
  summary: normalizeText(payload.summary, MAX_SUMMARY_CHARS),
  keyPoints: normalizeArray(payload.keyPoints, MAX_KEY_POINTS, 280),
  tasks: (Array.isArray(payload.tasks) ? payload.tasks : [])
    .map((task) => {
      const text = normalizeText(task?.text || task?.task || task?.title, 280);
      if (!text) return null;

      return {
        text,
        priority: normalizePriority(task?.priority),
        reason: normalizeText(task?.reason, 180),
        confidence:
          Number.isFinite(Number(task?.confidence))
            ? Math.max(0, Math.min(1, Number(task.confidence)))
            : null
      };
    })
    .filter(Boolean)
    .slice(0, MAX_TASKS),
  deadlines: (Array.isArray(payload.deadlines) ? payload.deadlines : [])
    .map((deadline) => {
      const text = normalizeText(deadline?.text || deadline?.title, 220);
      if (!text) return null;

      return {
        text,
        date: normalizeText(deadline?.date, 40),
        context: normalizeText(deadline?.context || deadline?.reason, 280)
      };
    })
    .filter(Boolean)
    .slice(0, MAX_DEADLINES),
  entities: (Array.isArray(payload.entities) ? payload.entities : [])
    .map((entity) => {
      const name = normalizeText(entity?.name || entity, 120);
      if (!name) return null;

      return {
        name,
        type: normalizeText(entity?.type, 40) || 'entity'
      };
    })
    .filter(Boolean)
    .slice(0, MAX_ENTITIES)
});

const splitSentences = (text) =>
  String(text || '')
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((line) => normalizeText(line, 320))
    .filter(Boolean);

const fallbackExtract = (sourceText) => {
  const sentences = splitSentences(sourceText);
  const taskSentences = sentences.filter((sentence) =>
    /\b(todo|task|action item|need to|should|must|follow up|schedule|send|create|review|fix|build|prepare|update|submit)\b/i.test(
      sentence
    )
  );
  const deadlineSentences = sentences.filter((sentence) =>
    /\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|deadline|due|by \d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(
      sentence
    )
  );
  const entityMatches = String(sourceText || '').match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) || [];

  return {
    summary: normalizeText(sentences.slice(0, 3).join(' '), MAX_SUMMARY_CHARS),
    keyPoints: sentences.slice(0, MAX_KEY_POINTS),
    tasks: taskSentences.slice(0, MAX_TASKS).map((sentence) => ({
      text: sentence
        .replace(/^(todo|task|action item)\s*[:\-]\s*/i, '')
        .replace(/^(we|i)\s+(need to|should|must)\s+/i, '')
        .trim(),
      priority: 'medium',
      reason: 'Detected actionable wording',
      confidence: 0.35
    })),
    deadlines: deadlineSentences.slice(0, MAX_DEADLINES).map((sentence) => ({
      text: sentence,
      date: '',
      context: 'Detected deadline wording'
    })),
    entities: normalizeArray(entityMatches, MAX_ENTITIES, 120).map((name) => ({
      name,
      type: 'entity'
    }))
  };
};

const buildPrompt = ({ sourceType, sourceLabel, sourceText }) => [
  'Extract useful review suggestions from workspace content.',
  'Return only valid JSON. Do not return markdown or prose.',
  'Output shape:',
  '{"summary":"string","keyPoints":["string"],"tasks":[{"text":"string","priority":"low|medium|high","reason":"string","confidence":0.0}],"deadlines":[{"text":"string","date":"string","context":"string"}],"entities":[{"name":"string","type":"person|organization|project|tool|topic|place|entity"}]}',
  'Rules:',
  '- Summary must be grounded and concise.',
  '- Tasks must be concrete actions a user could accept into a todo list.',
  '- Deadlines may include fuzzy dates like tomorrow/next week if exact dates are absent.',
  '- Entities should include important people, orgs, projects, tools, topics, or places.',
  '- If a category is empty, return an empty array.',
  '',
  `Source type: ${sourceType}`,
  `Source label: ${sourceLabel}`,
  '',
  'Source text:',
  sourceText
].join('\n');

const extractWithLlm = async ({ sourceType, sourceLabel, sourceText }) => {
  const openai = getClient();
  if (!openai) {
    return {
      payload: fallbackExtract(sourceText),
      extractor: 'fallback',
      model: '',
      warning: 'OPENAI_API_KEY is not configured'
    };
  }

  try {
    const response = await openai.responses.create({
      model: INSIGHT_MODEL,
      input: [
        {
          role: 'user',
          content: buildPrompt({ sourceType, sourceLabel, sourceText })
        }
      ]
    });

    const parsed = parseJsonPayload(response?.output_text);
    if (!parsed) {
      return {
        payload: fallbackExtract(sourceText),
        extractor: 'fallback-parse',
        model: INSIGHT_MODEL,
        warning: 'Model returned invalid JSON'
      };
    }

    return {
      payload: parsed,
      extractor: 'llm',
      model: INSIGHT_MODEL,
      warning: ''
    };
  } catch (error) {
    return {
      payload: fallbackExtract(sourceText),
      extractor: 'fallback',
      model: INSIGHT_MODEL,
      warning: error.message
    };
  }
};

const extractTextFromUploadedFile = async ({ file, buffer }) => {
  const mimetype = String(file?.mimetype || '').toLowerCase();
  const filename = String(file?.originalName || file?.filename || '').toLowerCase();

  if (!buffer || !Buffer.isBuffer(buffer)) {
    return '';
  }

  if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
    try {
      const parsed = await pdfParse(buffer);
      return normalizeText(parsed?.text, MAX_SOURCE_CHARS);
    } catch (error) {
      return normalizeText(file?.description || file?.originalName, MAX_SOURCE_CHARS);
    }
  }

  if (
    mimetype.startsWith('text/') ||
    mimetype === 'application/json' ||
    mimetype === 'application/xml' ||
    filename.endsWith('.md') ||
    filename.endsWith('.csv') ||
    filename.endsWith('.txt')
  ) {
    return normalizeText(buffer.toString('utf8'), MAX_SOURCE_CHARS);
  }

  return normalizeText(
    [file?.description, Array.isArray(file?.tags) ? file.tags.join(', ') : '']
      .filter(Boolean)
      .join('\n'),
    MAX_SOURCE_CHARS
  );
};

const getYouTubeSourceText = async (video) => {
  const transcriptText = normalizeText(video?.transcriptText, MAX_SOURCE_CHARS);
  if (transcriptText) return transcriptText;

  const chunks = await VideoIntelligenceChunk.find({
    userId: video.userId,
    youtubeId: video._id
  })
    .sort({ chunkIndex: 1 })
    .limit(18)
    .select('text')
    .lean();

  const chunkText = normalizeText(
    chunks.map((chunk) => chunk.text).filter(Boolean).join('\n\n'),
    MAX_SOURCE_CHARS
  );

  if (chunkText) return chunkText;

  return normalizeText(
    [video?.title, video?.channelTitle, video?.description].filter(Boolean).join('\n\n'),
    MAX_SOURCE_CHARS
  );
};

const hasUsefulInsight = (insight) =>
  Boolean(
    insight.summary ||
      insight.keyPoints.length ||
      insight.tasks.length ||
      insight.deadlines.length ||
      insight.entities.length
  );

const createContentInsight = async ({
  userId,
  sourceType,
  sourceId,
  sourceLabel,
  sourceText
}) => {
  const normalizedSourceText = normalizeText(sourceText, MAX_SOURCE_CHARS);
  if (!normalizedSourceText) {
    return null;
  }

  const extraction = await extractWithLlm({
    sourceType,
    sourceLabel,
    sourceText: normalizedSourceText
  });
  const normalized = normalizeInsightPayload(extraction.payload);

  if (!hasUsefulInsight(normalized)) {
    return null;
  }

  await ContentInsight.updateMany(
    {
      userId,
      sourceType,
      sourceId: String(sourceId),
      status: 'pending'
    },
    { status: 'rejected', warning: 'Superseded by newer extraction' }
  );

  const insight = new ContentInsight({
    userId,
    sourceType,
    sourceId: String(sourceId),
    sourceLabel: normalizeText(sourceLabel, 240),
    ...normalized,
    extractor: extraction.extractor,
    model: extraction.model,
    warning: normalizeText(extraction.warning, 500)
  });

  await insight.save();
  return insight;
};

const createInsightForUploadedFile = async ({ userId, file, buffer }) => {
  const sourceText = await extractTextFromUploadedFile({ file, buffer });
  return createContentInsight({
    userId,
    sourceType: 'file',
    sourceId: file._id,
    sourceLabel: file.originalName || file.filename,
    sourceText
  });
};

const createInsightForYouTube = async ({ userId, video }) => {
  const sourceText = await getYouTubeSourceText(video);
  return createContentInsight({
    userId,
    sourceType: 'youtube',
    sourceId: video._id,
    sourceLabel: video.title,
    sourceText
  });
};

const serializeInsight = (insight) => {
  if (!insight) return null;
  const raw = insight.toObject ? insight.toObject() : insight;
  return {
    _id: String(raw._id),
    sourceType: raw.sourceType,
    sourceId: raw.sourceId,
    sourceLabel: raw.sourceLabel,
    status: raw.status,
    summary: raw.summary || '',
    keyPoints: raw.keyPoints || [],
    tasks: (raw.tasks || []).map((task, index) => ({
      id: String(task._id || `task-${index}`),
      text: task.text,
      priority: task.priority,
      reason: task.reason,
      confidence: task.confidence
    })),
    deadlines: raw.deadlines || [],
    entities: raw.entities || [],
    extractor: raw.extractor || '',
    model: raw.model || '',
    warning: raw.warning || ''
  };
};

const normalizeSelectedTaskIds = (taskIds = []) =>
  new Set((Array.isArray(taskIds) ? taskIds : []).map((id) => String(id || '').trim()).filter(Boolean));

const ensureReviewCollection = async ({ userId, collectionId }) => {
  const explicitCollectionId = String(collectionId || '').trim();
  if (explicitCollectionId) {
    const collection = await Collection.findOne({ _id: explicitCollectionId, userId });
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  }

  let collection = await Collection.findOne({ userId, name: 'AI Action Items' });
  if (collection) return collection;

  collection = new Collection({
    userId,
    name: 'AI Action Items',
    description: 'Tasks accepted from automatic content extraction',
    color: '#3B82F6',
    icon: 'Sparkles',
    tags: ['ai', 'tasks'],
    isPrivate: true
  });
  await collection.save();
  return collection;
};

const acceptContentInsight = async ({ userId, insightId, taskIds, collectionId, title }) => {
  const insight = await ContentInsight.findOne({ _id: insightId, userId });
  if (!insight) {
    throw new Error('Insight not found');
  }

  const hasExplicitTaskSelection = Array.isArray(taskIds);
  const selectedIds = normalizeSelectedTaskIds(taskIds);
  const selectedTasks = insight.tasks.filter((task, index) => {
    if (!hasExplicitTaskSelection) return true;
    return selectedIds.has(String(task._id)) || selectedIds.has(`task-${index}`);
  });

  let widget = null;
  let collection = null;

  if (selectedTasks.length) {
    collection = await ensureReviewCollection({ userId, collectionId });
    widget = new PlannerWidget({
      userId,
      widgetType: 'todo-list',
      title: normalizeText(title, 100) || `Action items: ${insight.sourceLabel || 'Content'}`,
      data: {
        source: 'content_insight',
        sourceType: insight.sourceType,
        sourceId: insight.sourceId,
        insightId: String(insight._id),
        items: selectedTasks.map((task) => ({
          text: task.text,
          done: false
        }))
      }
    });

    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();
    await collection.addItem('planner', String(widget._id));

    insight.acceptedWidgetId = String(widget._id);
    insight.acceptedCollectionId = String(collection._id);
  }

  insight.status = 'accepted';
  await insight.save();

  return {
    insight: serializeInsight(insight),
    acceptedCount: selectedTasks.length,
    widget,
    collection: collection
      ? {
          _id: String(collection._id),
          name: collection.name
        }
      : null
  };
};

const rejectContentInsight = async ({ userId, insightId }) => {
  const insight = await ContentInsight.findOne({ _id: insightId, userId });
  if (!insight) {
    throw new Error('Insight not found');
  }

  insight.status = 'rejected';
  await insight.save();

  return {
    insight: serializeInsight(insight)
  };
};

module.exports = {
  createInsightForUploadedFile,
  createInsightForYouTube,
  serializeInsight,
  acceptContentInsight,
  rejectContentInsight
};
