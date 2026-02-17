const MINUTE_MS = 60 * 1000;

const toDate = (value) => {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const mergeIntervals = (intervals) => {
  const sorted = (intervals || [])
    .map((it) => ({
      start: toDate(it.start),
      end: toDate(it.end)
    }))
    .filter((it) => it.start && it.end && it.end.getTime() > it.start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged = [];
  for (const it of sorted) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(it);
      continue;
    }

    if (it.start.getTime() <= last.end.getTime()) {
      if (it.end.getTime() > last.end.getTime()) last.end = it.end;
      continue;
    }

    merged.push(it);
  }

  return merged;
};

const invertIntervals = ({ windowStart, windowEnd, busy }) => {
  const ws = toDate(windowStart);
  const we = toDate(windowEnd);
  if (!ws || !we || we.getTime() <= ws.getTime()) return [];

  const busyMerged = mergeIntervals(busy).map((it) => ({
    start: new Date(Math.max(it.start.getTime(), ws.getTime())),
    end: new Date(Math.min(it.end.getTime(), we.getTime()))
  })).filter((it) => it.end.getTime() > it.start.getTime());

  const free = [];
  let cursor = ws;
  for (const b of busyMerged) {
    if (b.start.getTime() > cursor.getTime()) {
      free.push({ start: cursor, end: b.start });
    }
    if (b.end.getTime() > cursor.getTime()) cursor = b.end;
  }

  if (we.getTime() > cursor.getTime()) free.push({ start: cursor, end: we });
  return free;
};

const intervalMinutes = (it) => Math.floor((it.end.getTime() - it.start.getTime()) / MINUTE_MS);

const shiftWindowByDays = ({ windowStart, windowEnd, days }) => {
  const ws = toDate(windowStart);
  const we = toDate(windowEnd);
  if (!ws || !we) return null;
  const delta = days * 24 * 60 * MINUTE_MS;
  return {
    start: new Date(ws.getTime() + delta),
    end: new Date(we.getTime() + delta)
  };
};

/**
 * Decide how to schedule a block inside a time window given busy intervals.
 *
 * Inputs are Dates or date-like strings.
 */
function planSchedule({
  title,
  durationMinutes,
  windowStart,
  windowEnd,
  busy,
  conflictStrategy = 'auto',
  minSessionMinutes = 30,
  maxSplitParts = 6,
  allowLightPractice = true,
  searchDays = 14
}) {
  const requestedMinutes = clampInt(durationMinutes, 1, 24 * 60, 60);
  const minSession = clampInt(minSessionMinutes, 5, requestedMinutes, 30);
  const maxParts = clampInt(maxSplitParts, 1, 24, 6);
  const daysLookahead = clampInt(searchDays, 0, 60, 14);

  const normalizeResult = (result) => ({
    title: String(title || 'Practice').trim() || 'Practice',
    requestedMinutes,
    ...result
  });

  const attemptInWindow = (ws, we) => {
    const free = invertIntervals({ windowStart: ws, windowEnd: we, busy });
    const freeWithMinutes = free
      .map((it) => ({ ...it, minutes: intervalMinutes(it) }))
      .filter((it) => it.minutes > 0);

    // 1) Exact fit: find earliest slot that holds full duration.
    const exact = freeWithMinutes.find((it) => it.minutes >= requestedMinutes);
    if (exact) {
      const start = exact.start;
      const end = new Date(start.getTime() + requestedMinutes * MINUTE_MS);
      return normalizeResult({
        strategyUsed: 'exact',
        scheduledMinutes: requestedMinutes,
        sessions: [
          {
            start,
            end,
            lightPractice: false,
            summarySuffix: null
          }
        ]
      });
    }

    const totalFree = freeWithMinutes.reduce((sum, it) => sum + it.minutes, 0);
    const maxGap = freeWithMinutes.reduce((m, it) => Math.max(m, it.minutes), 0);

    // Helper to split across multiple gaps.
    const trySplit = () => {
      if (totalFree < requestedMinutes) return null;

      let remaining = requestedMinutes;
      const sessions = [];

      for (const it of freeWithMinutes) {
        if (sessions.length >= maxParts) break;
        if (remaining <= 0) break;

        const usable = Math.min(it.minutes, remaining);
        if (usable < minSession) continue;

        const start = it.start;
        const end = new Date(start.getTime() + usable * MINUTE_MS);
        sessions.push({
          start,
          end,
          lightPractice: false,
          summarySuffix: sessions.length ? `Part ${sessions.length + 1}` : null
        });

        remaining -= usable;
      }

      if (remaining > 0) return null;

      return normalizeResult({
        strategyUsed: 'split',
        scheduledMinutes: requestedMinutes,
        sessions
      });
    };

    const tryShorten = () => {
      if (!allowLightPractice) return null;
      if (maxGap < minSession) return null;
      const best = freeWithMinutes.reduce((bestIt, it) =>
        !bestIt || it.minutes > bestIt.minutes ? it : bestIt,
        null);
      if (!best) return null;
      const shortened = Math.min(requestedMinutes, best.minutes);
      const start = best.start;
      const end = new Date(start.getTime() + shortened * MINUTE_MS);
      return normalizeResult({
        strategyUsed: 'shorten',
        scheduledMinutes: shortened,
        sessions: [
          {
            start,
            end,
            lightPractice: shortened < requestedMinutes,
            summarySuffix: shortened < requestedMinutes ? 'Light Practice' : null
          }
        ]
      });
    };

    if (conflictStrategy === 'split') {
      return trySplit() || normalizeResult({
        strategyUsed: 'split',
        scheduledMinutes: 0,
        sessions: [],
        reason: 'Not enough free time to split into sessions'
      });
    }

    if (conflictStrategy === 'shorten') {
      return tryShorten() || normalizeResult({
        strategyUsed: 'shorten',
        scheduledMinutes: 0,
        sessions: [],
        reason: 'No suitable gap for a minimum session'
      });
    }

    if (conflictStrategy === 'next-window') {
      return null;
    }

    // auto: prefer split (if it can fully satisfy), otherwise shorten, otherwise next-window.
    return trySplit() || tryShorten() || null;
  };

  // First attempt in the provided window
  const first = attemptInWindow(windowStart, windowEnd);
  if (first) {
    return { ...first, searchedDays: 0 };
  }

  // Next-window search
  for (let d = 1; d <= daysLookahead; d += 1) {
    const shifted = shiftWindowByDays({ windowStart, windowEnd, days: d });
    if (!shifted) break;
    const planned = attemptInWindow(shifted.start, shifted.end);
    if (planned) {
      return { ...planned, strategyUsed: planned.strategyUsed === 'exact' ? 'next-window' : planned.strategyUsed, searchedDays: d };
    }
  }

  return normalizeResult({
    strategyUsed: 'none',
    scheduledMinutes: 0,
    sessions: [],
    searchedDays: daysLookahead,
    reason: 'No suitable free time found within search window'
  });
}

module.exports = {
  planSchedule,
  mergeIntervals,
  invertIntervals
};
