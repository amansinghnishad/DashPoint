const Collection = require('../models/Collection');
const File = require('../models/File');
const PlannerWidget = require('../models/PlannerWidget');
const User = require('../models/User');
const YouTube = require('../models/YouTube');
const { getAssistantMemoryForUser } = require('./assistantMemoryService');
const { getCalendarClient, normalizeEvent } = require('./googleCalendarService');

const RECENT_LIMIT = 6;
const TASK_LIMIT = 12;
const PRIORITY_LIMIT = 5;

const normalizeText = (value, maxLength = 240) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const toIso = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getZonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    hour12: false
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
};

const zonedDateTimeToUtc = ({ year, month, day, hour = 0, minute = 0, second = 0, timeZone }) => {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const guessedParts = getZonedParts(new Date(utcGuess), timeZone);
  const guessedAsUtc = Date.UTC(
    guessedParts.year,
    guessedParts.month - 1,
    guessedParts.day,
    guessedParts.hour,
    guessedParts.minute,
    guessedParts.second
  );

  return new Date(utcGuess - (guessedAsUtc - utcGuess));
};

const resolveTodayRange = (timeZone = 'UTC') => {
  const safeTimeZone = normalizeText(timeZone, 100) || 'UTC';
  let parts;

  try {
    parts = getZonedParts(new Date(), safeTimeZone);
  } catch {
    parts = getZonedParts(new Date(), 'UTC');
  }

  const start = zonedDateTimeToUtc({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    timeZone: safeTimeZone
  });
  const nextDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  const nextParts = {
    year: nextDay.getUTCFullYear(),
    month: nextDay.getUTCMonth() + 1,
    day: nextDay.getUTCDate()
  };
  const end = zonedDateTimeToUtc({
    ...nextParts,
    timeZone: safeTimeZone
  });

  return {
    timeZone: safeTimeZone,
    start,
    end,
    localDate: `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
  };
};

const getTodayEvents = async ({ user, range }) => {
  if (!user?.googleCalendar?.connected || !user?.googleCalendar?.refreshToken) {
    return {
      connected: false,
      events: [],
      warning: 'Google Calendar is not connected'
    };
  }

  try {
    const { calendar } = getCalendarClient({
      accessToken: user.googleCalendar.accessToken,
      refreshToken: user.googleCalendar.refreshToken,
      tokenExpiryDate: user.googleCalendar.tokenExpiryDate
    });
    const calendarId = user.googleCalendar.calendarId || 'primary';
    const response = await calendar.events.list({
      calendarId,
      timeMin: range.start.toISOString(),
      timeMax: range.end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 30
    });

    return {
      connected: true,
      calendarId,
      events: (response?.data?.items || []).map(normalizeEvent),
      warning: ''
    };
  } catch (error) {
    return {
      connected: true,
      events: [],
      warning: error.message
    };
  }
};

const getCollectionMapForPlannerWidgets = async ({ userId, widgetIds }) => {
  const normalizedWidgetIds = [...new Set(widgetIds.map((id) => String(id || '')).filter(Boolean))];
  if (!normalizedWidgetIds.length) {
    return new Map();
  }

  const collections = await Collection.find({
    userId,
    items: {
      $elemMatch: {
        itemType: 'planner',
        itemId: { $in: normalizedWidgetIds }
      }
    }
  })
    .select('_id name items')
    .lean();

  const map = new Map();
  collections.forEach((collection) => {
    (collection.items || []).forEach((item) => {
      if (item.itemType !== 'planner') return;
      const itemId = String(item.itemId || '');
      if (!normalizedWidgetIds.includes(itemId) || map.has(itemId)) return;
      map.set(itemId, {
        collectionId: String(collection._id),
        collectionName: collection.name
      });
    });
  });

  return map;
};

const getPendingTasks = async ({ userId }) => {
  const widgets = await PlannerWidget.find({
    userId,
    widgetType: 'todo-list',
    'data.items': { $exists: true }
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select('_id title widgetType data updatedAt')
    .lean();

  const collectionMap = await getCollectionMapForPlannerWidgets({
    userId,
    widgetIds: widgets.map((widget) => widget._id)
  });

  const tasks = [];
  widgets.forEach((widget) => {
    const collection = collectionMap.get(String(widget._id)) || {};
    const items = Array.isArray(widget?.data?.items) ? widget.data.items : [];

    items.forEach((item, index) => {
      const text = normalizeText(item?.text, 280);
      if (!text || item?.done === true) return;

      tasks.push({
        id: `${widget._id}:${index}`,
        text,
        widgetId: String(widget._id),
        widgetTitle: widget.title || 'Todo list',
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        source: widget?.data?.source || '',
        updatedAt: toIso(widget.updatedAt)
      });
    });
  });

  return tasks.slice(0, TASK_LIMIT);
};

const getRecentFiles = async ({ userId }) => {
  const files = await File.find({ userId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(RECENT_LIMIT)
    .select('_id originalName filename mimetype size url updatedAt createdAt')
    .lean();

  return files.map((file) => ({
    id: String(file._id),
    title: file.originalName || file.filename,
    subtitle: file.mimetype || 'File',
    url: file.url,
    size: file.size,
    updatedAt: toIso(file.updatedAt || file.createdAt)
  }));
};

const getRecentVideos = async ({ userId }) => {
  const videos = await YouTube.find({ userId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(RECENT_LIMIT)
    .select('_id videoId title channelTitle url thumbnail duration transcriptStatus updatedAt createdAt')
    .lean();

  return videos.map((video) => ({
    id: String(video._id),
    videoId: video.videoId,
    title: video.title,
    subtitle: video.channelTitle || 'YouTube',
    url: video.url,
    thumbnail: video.thumbnail,
    duration: video.duration,
    transcriptStatus: video.transcriptStatus,
    updatedAt: toIso(video.updatedAt || video.createdAt)
  }));
};

const buildPrioritySuggestions = ({ events, tasks, recentVideos, memory }) => {
  const suggestions = [];
  const now = Date.now();
  const upcomingEvent = events
    .map((event) => ({
      ...event,
      startMs: new Date(event.start).getTime()
    }))
    .filter((event) => Number.isFinite(event.startMs) && event.startMs >= now)
    .sort((a, b) => a.startMs - b.startMs)[0];

  if (upcomingEvent) {
    suggestions.push({
      id: 'next-event',
      title: `Prepare for ${upcomingEvent.summary}`,
      reason: 'Next calendar event today',
      type: 'calendar_event',
      metadata: {
        eventId: upcomingEvent.id,
        start: upcomingEvent.start
      }
    });
  }

  tasks.slice(0, 3).forEach((task, index) => {
    suggestions.push({
      id: `task-${index + 1}`,
      title: task.text,
      reason: task.source === 'youtube_learning_workflow' ? 'Unfinished action item' : 'Pending task',
      type: 'task',
      metadata: {
        widgetId: task.widgetId,
        collectionId: task.collectionId
      }
    });
  });

  const recurringGoal = memory?.recurringGoals?.[0];
  if (recurringGoal) {
    suggestions.push({
      id: 'recurring-goal',
      title: recurringGoal,
      reason: 'Stored recurring goal',
      type: 'goal',
      metadata: {}
    });
  }

  if (recentVideos[0] && suggestions.length < PRIORITY_LIMIT) {
    suggestions.push({
      id: 'recent-video',
      title: `Review ${recentVideos[0].title}`,
      reason: 'Recently saved video',
      type: 'youtube',
      metadata: {
        youtubeId: recentVideos[0].id,
        videoId: recentVideos[0].videoId
      }
    });
  }

  return suggestions.slice(0, PRIORITY_LIMIT);
};

const getFocusSummary = async ({ userId }) => {
  const user = await User.findById(userId).select(
    '+googleCalendar.accessToken +googleCalendar.refreshToken +googleCalendar.tokenExpiryDate googleCalendar.connected googleCalendar.calendarId preferences firstName lastName'
  );
  if (!user) {
    throw new Error('User not found');
  }

  const { memory } = await getAssistantMemoryForUser(userId);
  const preferredTimezone =
    memory?.workingHours?.timezone || user.preferences?.timezone || 'UTC';
  const today = resolveTodayRange(preferredTimezone);

  const [calendar, pendingTasks, recentFiles, recentVideos] = await Promise.all([
    getTodayEvents({ user, range: today }),
    getPendingTasks({ userId }),
    getRecentFiles({ userId }),
    getRecentVideos({ userId })
  ]);

  const unfinishedActionItems = pendingTasks.filter(
    (task) =>
      task.source === 'youtube_learning_workflow' ||
      task.source === 'content_insight' ||
      /action item|action items/i.test(task.widgetTitle)
  );

  return {
    today: {
      date: today.localDate,
      timeZone: today.timeZone,
      start: today.start.toISOString(),
      end: today.end.toISOString()
    },
    calendar,
    pendingTasks,
    unfinishedActionItems,
    recent: {
      files: recentFiles,
      videos: recentVideos
    },
    priorities: buildPrioritySuggestions({
      events: calendar.events,
      tasks: pendingTasks,
      recentVideos,
      memory
    }),
    memory: {
      preferredMeetingLengthMinutes: memory.preferredMeetingLengthMinutes,
      taskPriorities: memory.taskPriorities,
      recurringGoals: memory.recurringGoals
    }
  };
};

module.exports = {
  getFocusSummary
};
