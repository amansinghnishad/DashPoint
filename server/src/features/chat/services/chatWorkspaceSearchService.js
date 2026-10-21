const {
  searchCollections
} = require('../../search/services/adapters/collectionsSearchAdapter');
const { searchFiles } = require('../../search/services/adapters/filesSearchAdapter');
const { searchPlannerWidgets } = require('../../search/services/adapters/plannerWidgetsSearchAdapter');
const {
  searchYouTubeVideos,
  searchYouTubeTranscripts
} = require('../../search/services/adapters/youtubeSearchAdapter');
const { searchCalendarEvents } = require('../../search/services/adapters/calendarSearchAdapter');

const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'can', 'did', 'do', 'for', 'from', 'give', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'show', 'tell', 'that',
  'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which', 'who', 'with', 'would',
  'you', 'your'
]);
const MAX_TERMS = 8;
const MAX_RESULTS_PER_SOURCE = 3;
const MAX_SOURCE_CHARS = 700;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSearchTerms = (query) =>
  [...new Set(String(query || '').toLowerCase().match(/[a-z0-9][a-z0-9_-]{1,}/g) || [])]
    .filter((term) => !STOP_WORDS.has(term))
    .slice(0, MAX_TERMS);

const truncate = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SOURCE_CHARS);

const toChatSource = (result, sourceType) => ({
  sourceType,
  sourceId: String(result.id || ''),
  sourceLabel: String(result.title || 'Workspace item').trim(),
  content: truncate([result.title, result.subtitle, result.snippet].filter(Boolean).join('\n')),
  url: String(result.url || ''),
  metadata: result.metadata || {},
  score: Number(result.score) || 0
});

const searchChatWorkspace = async ({
  userId,
  query,
  collectionIds = [],
  restrictToCollections = false
}) => {
  const terms = getSearchTerms(query);
  if (!terms.length) return { items: [], warnings: [] };
  if (restrictToCollections && !collectionIds.length) return { items: [], warnings: [] };

  const regex = new RegExp(terms.map(escapeRegex).join('|'), 'i');
  const limit = MAX_RESULTS_PER_SOURCE * 2;
  const sources = [
    ['collections', () => searchCollections({ userId, regex, limit }), []],
    ['files', () => searchFiles({ userId, regex, limit }), []],
    ['planner', () => searchPlannerWidgets({ userId, regex, limit }), []],
    ['videos', () => searchYouTubeVideos({ userId, regex, limit }), []],
    ['transcripts', () => searchYouTubeTranscripts({ userId, regex, limit }), []],
    ...(!restrictToCollections ? [[
      'calendar',
      () => searchCalendarEvents({ userId, query: terms.join(' '), limit: MAX_RESULTS_PER_SOURCE }),
      { results: [], warning: '' }
    ]] : [])
  ];
  const settledSources = await Promise.all(
    sources.map(async ([name, search, fallback]) => {
      try {
        return { name, value: await search() };
      } catch (error) {
        console.warn(`[ChatSearch] ${name} search failed:`, error.message);
        return {
          name,
          value: fallback,
          warning: `${name} search is temporarily unavailable`
        };
      }
    })
  );
  const sourceResults = Object.fromEntries(settledSources.map(({ name, value }) => [name, value]));
  const searchWarnings = settledSources.map(({ warning }) => warning).filter(Boolean);
  const { collections, files, planner, videos, transcripts } = sourceResults;
  const calendar = sourceResults.calendar || { results: [], warning: '' };

  const selectedIds = new Set((collectionIds || []).map(String));
  const hasCollectionScope = selectedIds.size > 0;
  const groupedResults = [
    ['collection', collections],
    ['file', files],
    ['planner_note', planner],
    ['youtube', videos],
    ['youtube_transcript', transcripts],
    ['calendar_event', calendar.results || []]
  ];

  return {
    items: groupedResults.flatMap(([sourceType, results]) => {
      const scopedResults = hasCollectionScope
        ? results.filter((result) => {
            const collectionId = String(result.metadata?.collectionId || '');
            return selectedIds.has(collectionId);
          })
        : results;

      return scopedResults.slice(0, MAX_RESULTS_PER_SOURCE).map((result) =>
        toChatSource(result, sourceType)
      );
    }),
    warnings: [...searchWarnings, ...(calendar.warning ? [calendar.warning] : [])]
  };
};

module.exports = { searchChatWorkspace };
