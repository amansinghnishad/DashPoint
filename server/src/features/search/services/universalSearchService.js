const { searchCollections } = require('./adapters/collectionsSearchAdapter');
const { searchFiles } = require('./adapters/filesSearchAdapter');
const { searchPlannerWidgets } = require('./adapters/plannerWidgetsSearchAdapter');
const {
  searchYouTubeVideos,
  searchYouTubeTranscripts
} = require('./adapters/youtubeSearchAdapter');
const { searchChatHistory } = require('./adapters/chatHistorySearchAdapter');
const { searchCalendarEvents } = require('./adapters/calendarSearchAdapter');
const { normalizeQuery, clampLimit, buildRegex } = require('./searchResultUtils');

const DEFAULT_LIMIT = 6;

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
  const [collections, files, plannerWidgets, youtubeVideos, youtubeTranscripts, chatHistory, calendar] =
    await Promise.all([
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
