const OpenAI = require('openai');

const EXTRACTION_MODEL =
  process.env.ACTION_ITEM_EXTRACTION_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const MAX_RAW_TEXT_CHARS = 25000;
const DEFAULT_MAX_ITEMS = 8;
const MAX_ITEMS = 20;

let client = null;

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
};

const clampMaxItems = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_MAX_ITEMS;
  }

  return Math.max(1, Math.min(parsed, MAX_ITEMS));
};

const normalizeText = (value, maxLength = 280) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const normalizePriority = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }

  return 'medium';
};

const normalizeConfidence = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(1, parsed));
};

const buildPrompt = ({ rawText, maxItems }) => ({
  system:
    'You extract actionable tasks from user text. Return only valid JSON. Never return prose.',
  user: [
    'Extract concrete action items from the text below.',
    `Return at most ${maxItems} items.`,
    "Only include tasks someone can actually do (verbs like create, send, fix, review, schedule).",
    'Ignore vague statements or background information.',
    'Output JSON format:',
    '{"actionItems":[{"text":"string","priority":"low|medium|high","reason":"string","confidence":0.0}]}',
    'Rules:',
    '- "text" must be concise and imperative.',
    '- "reason" should be brief (max 140 chars).',
    '- "confidence" between 0 and 1.',
    '- If no tasks found, return {"actionItems":[]}.',
    '',
    'Raw text:',
    rawText
  ].join('\n')
});

const parseJsonPayload = (text) => {
  const raw = String(text || '').trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;

    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
};

const normalizeActionItems = (actionItems, maxItems) => {
  const seen = new Set();

  return (Array.isArray(actionItems) ? actionItems : [])
    .map((item, index) => {
      const text = normalizeText(item?.text || item?.task || item?.summary, 280);
      if (!text) return null;

      const dedupeKey = text.toLowerCase();
      if (seen.has(dedupeKey)) {
        return null;
      }
      seen.add(dedupeKey);

      const reason = normalizeText(item?.reason, 140);
      const priority = normalizePriority(item?.priority);
      const confidence = normalizeConfidence(item?.confidence);

      return {
        id: `ai-task-${index + 1}`,
        text,
        reason,
        priority,
        confidence
      };
    })
    .filter(Boolean)
    .slice(0, maxItems);
};

const fallbackExtractFromText = ({ rawText, maxItems }) => {
  const candidates = rawText
    .split(/\r?\n|[.!?]+/g)
    .map((line) => normalizeText(line, 280))
    .filter(Boolean);

  const verbs = [
    'create',
    'add',
    'update',
    'review',
    'fix',
    'send',
    'schedule',
    'call',
    'email',
    'prepare',
    'write',
    'implement',
    'test',
    'deploy',
    'refactor'
  ];

  const seen = new Set();
  const output = [];

  for (const line of candidates) {
    const lowered = line.toLowerCase();
    const looksActionable =
      verbs.some((verb) => lowered.includes(`${verb} `) || lowered.startsWith(`${verb}`)) ||
      lowered.includes('need to') ||
      lowered.includes('todo') ||
      lowered.includes('action item');

    if (!looksActionable) {
      continue;
    }

    const text = line.replace(/^(todo|action item)\s*[:\-]\s*/i, '').trim();
    if (!text) continue;

    const dedupeKey = text.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    output.push({
      id: `fallback-task-${output.length + 1}`,
      text: normalizeText(text, 280),
      reason: 'Extracted using fallback rules',
      priority: 'medium',
      confidence: 0.35
    });

    if (output.length >= maxItems) {
      break;
    }
  }

  return output;
};

const extractActionItemsFromText = async ({ rawText, maxItems }) => {
  const normalizedText = normalizeText(rawText, MAX_RAW_TEXT_CHARS);
  if (!normalizedText) {
    return {
      suggestions: [],
      meta: {
        model: EXTRACTION_MODEL,
        maxItems: clampMaxItems(maxItems),
        extractor: 'none'
      }
    };
  }

  const resolvedMaxItems = clampMaxItems(maxItems);
  const prompt = buildPrompt({
    rawText: normalizedText,
    maxItems: resolvedMaxItems
  });

  try {
    const openai = getClient();
    const response = await openai.responses.create({
      model: EXTRACTION_MODEL,
      input: [
        {
          role: 'system',
          content: prompt.system
        },
        {
          role: 'user',
          content: prompt.user
        }
      ]
    });

    const parsed = parseJsonPayload(response?.output_text);
    const suggestions = normalizeActionItems(parsed?.actionItems, resolvedMaxItems);

    if (!suggestions.length) {
      const fallbackSuggestions = fallbackExtractFromText({
        rawText: normalizedText,
        maxItems: resolvedMaxItems
      });

      return {
        suggestions: fallbackSuggestions,
        meta: {
          model: EXTRACTION_MODEL,
          maxItems: resolvedMaxItems,
          extractor: parsed ? 'fallback-empty' : 'fallback-parse'
        }
      };
    }

    return {
      suggestions,
      meta: {
        model: EXTRACTION_MODEL,
        maxItems: resolvedMaxItems,
        extractor: 'llm'
      }
    };
  } catch (error) {
    const fallbackSuggestions = fallbackExtractFromText({
      rawText: normalizedText,
      maxItems: resolvedMaxItems
    });

    return {
      suggestions: fallbackSuggestions,
      meta: {
        model: EXTRACTION_MODEL,
        maxItems: resolvedMaxItems,
        extractor: 'fallback',
        warning: error.message
      }
    };
  }
};

const mapSuggestionsToTodoItems = (suggestions = []) =>
  (Array.isArray(suggestions) ? suggestions : [])
    .map((item) => normalizeText(item?.text, 280))
    .filter(Boolean)
    .map((text) => ({
      text,
      done: false
    }));

module.exports = {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
};
