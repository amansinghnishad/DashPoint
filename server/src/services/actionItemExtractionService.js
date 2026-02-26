const OpenAI = require('openai');

const EXTRACTION_MODEL =
  process.env.ACTION_ITEM_EXTRACTION_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const MAX_RAW_TEXT_CHARS = 25000;
const DEFAULT_MAX_ITEMS = 8;
const MAX_ITEMS = 20;
const ACTION_VERBS = [
  'add',
  'analyze',
  'build',
  'call',
  'create',
  'debug',
  'deploy',
  'document',
  'email',
  'fix',
  'implement',
  'improve',
  'learn',
  'manage',
  'plan',
  'practice',
  'prepare',
  'refactor',
  'research',
  'review',
  'schedule',
  'send',
  'test',
  'train',
  'update',
  'write',
  'work'
];
const ACTION_PREFIXES = [
  'i need to',
  'we need to',
  'need to',
  'should',
  'must',
  'have to',
  'todo',
  'action item',
  'task'
];
const GERUND_TO_BASE = {
  analyzing: 'analyze',
  building: 'build',
  creating: 'create',
  debugging: 'debug',
  deploying: 'deploy',
  documenting: 'document',
  emailing: 'email',
  fixing: 'fix',
  implementing: 'implement',
  improving: 'improve',
  learning: 'learn',
  managing: 'manage',
  planning: 'plan',
  practicing: 'practice',
  preparing: 'prepare',
  refactoring: 'refactor',
  researching: 'research',
  reviewing: 'review',
  scheduling: 'schedule',
  sending: 'send',
  testing: 'test',
  training: 'train',
  updating: 'update',
  writing: 'write',
  working: 'work'
};
const NON_TASK_STARTERS = new Set([
  'a',
  'an',
  'the',
  'this',
  'that',
  'there',
  'it',
  'is',
  'are',
  'was',
  'were'
]);
const NEGATIVE_TASK_PATTERNS = [
  /\bno\b\s+(action item|action items|task|tasks|todo|todos)\b/i,
  /\bnothing\s+to\s+(do|action)\b/i,
  /\bnot\s+actionable\b/i
];

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

const hasNegativeTaskCue = (line) =>
  NEGATIVE_TASK_PATTERNS.some((pattern) => pattern.test(String(line || '')));

const splitIntoCandidates = (rawText) => {
  const roughSegments = String(rawText || '')
    .split(/\r?\n|[.!?;]+|,+/g)
    .flatMap((segment) => segment.split(/\s+\band\b\s+/i));

  return roughSegments
    .map((line) => normalizeText(line, 280))
    .filter(Boolean);
};

const normalizeCandidateTaskText = (value) => {
  let text = normalizeText(value, 280)
    .replace(/^(todo|action item|task)\s*[:\-]\s*/i, '')
    .replace(/^(i|we)\s+(need to|should|must|have to|want to|will|am going to)\s+/i, '')
    .replace(/^(need to|should|must|have to|please)\s+/i, '')
    .trim();

  if (!text) return '';

  const words = text.split(/\s+/);
  const firstWordLower = words[0].toLowerCase();
  if (GERUND_TO_BASE[firstWordLower]) {
    words[0] = GERUND_TO_BASE[firstWordLower];
    text = words.join(' ');
  }

  const topicPracticeMatch = text.match(/^([a-z0-9+#._-]+)\s+practice\b(.*)$/i);
  if (topicPracticeMatch) {
    const topic = topicPracticeMatch[1];
    const remainder = topicPracticeMatch[2] || '';
    text = `practice ${topic}${remainder}`;
  }

  return normalizeText(text, 280);
};

const hasActionCue = (line) => {
  const lowered = String(line || '').toLowerCase();
  if (!lowered) return false;
  if (hasNegativeTaskCue(lowered)) return false;

  if (ACTION_PREFIXES.some((prefix) => lowered.startsWith(prefix))) {
    return true;
  }

  return ACTION_VERBS.some((verb) => {
    const verbPattern = new RegExp(`\\b${verb}\\b`, 'i');
    return verbPattern.test(lowered);
  });
};

const isLikelyTaskPhrase = (line) => {
  const lowered = String(line || '').trim().toLowerCase();
  if (!lowered || lowered.endsWith('?')) return false;
  if (hasNegativeTaskCue(lowered)) return false;

  const words = lowered.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 10) return false;
  if (NON_TASK_STARTERS.has(words[0])) return false;

  return true;
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
  const candidates = splitIntoCandidates(rawText);

  const seen = new Set();
  const output = [];

  for (const candidate of candidates) {
    const text = normalizeCandidateTaskText(candidate);
    if (!text) continue;
    if (hasNegativeTaskCue(text)) continue;

    const looksActionable = hasActionCue(text) || isLikelyTaskPhrase(text);
    if (!looksActionable) {
      continue;
    }

    const dedupeKey = text.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const hasVerbCue = hasActionCue(text);

    output.push({
      id: `fallback-task-${output.length + 1}`,
      text,
      reason: hasVerbCue
        ? 'Detected actionable wording'
        : 'Detected concise task phrase',
      priority: 'medium',
      confidence: hasVerbCue ? 0.45 : 0.3
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
