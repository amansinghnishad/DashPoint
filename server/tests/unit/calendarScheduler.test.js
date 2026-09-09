const {
  planSchedule,
  mergeIntervals,
  invertIntervals
} = require('../../src/services/calendarScheduler');

describe('Calendar Scheduler Unit Tests', () => {
  const baseDate = new Date('2026-08-25T09:00:00.000Z');
  const windowStart = new Date('2026-08-25T09:00:00.000Z');
  const windowEnd = new Date('2026-08-25T17:00:00.000Z'); // 8 hours = 480 mins

  describe('mergeIntervals', () => {
    it('should coalesce overlapping intervals into unified blocks', () => {
      const busy = [
        {
          start: new Date('2026-08-25T10:00:00.000Z'),
          end: new Date('2026-08-25T11:00:00.000Z')
        },
        {
          start: new Date('2026-08-25T10:30:00.000Z'),
          end: new Date('2026-08-25T12:00:00.000Z')
        }
      ];

      const merged = mergeIntervals(busy);
      expect(merged).toHaveLength(1);
      expect(merged[0].start.toISOString()).toBe('2026-08-25T10:00:00.000Z');
      expect(merged[0].end.toISOString()).toBe('2026-08-25T12:00:00.000Z');
    });

    it('should keep disjoint intervals separate', () => {
      const busy = [
        {
          start: new Date('2026-08-25T10:00:00.000Z'),
          end: new Date('2026-08-25T11:00:00.000Z')
        },
        {
          start: new Date('2026-08-25T13:00:00.000Z'),
          end: new Date('2026-08-25T14:00:00.000Z')
        }
      ];

      const merged = mergeIntervals(busy);
      expect(merged).toHaveLength(2);
    });
  });

  describe('invertIntervals', () => {
    it('should calculate free slots correctly around busy blocks', () => {
      const busy = [
        {
          start: new Date('2026-08-25T10:00:00.000Z'),
          end: new Date('2026-08-25T11:00:00.000Z')
        }
      ];

      const free = invertIntervals({ windowStart, windowEnd, busy });
      expect(free).toHaveLength(2);
      expect(free[0].start.toISOString()).toBe(windowStart.toISOString());
      expect(free[0].end.toISOString()).toBe('2026-08-25T10:00:00.000Z');
      expect(free[1].start.toISOString()).toBe('2026-08-25T11:00:00.000Z');
      expect(free[1].end.toISOString()).toBe(windowEnd.toISOString());
    });
  });

  describe('planSchedule', () => {
    it('should schedule an exact fit when a single continuous gap is available', () => {
      const plan = planSchedule({
        title: 'Deep Work Session',
        durationMinutes: 60,
        windowStart,
        windowEnd,
        busy: []
      });

      expect(plan.strategyUsed).toBe('exact');
      expect(plan.scheduledMinutes).toBe(60);
      expect(plan.sessions).toHaveLength(1);
      expect(plan.sessions[0].start.toISOString()).toBe(windowStart.toISOString());
    });

    it('should split duration across multiple free gaps when continuous slot is unavailable', () => {
      const busy = [
        {
          start: new Date('2026-08-25T09:45:00.000Z'),
          end: new Date('2026-08-25T10:15:00.000Z')
        },
        {
          start: new Date('2026-08-25T11:00:00.000Z'),
          end: new Date('2026-08-25T17:00:00.000Z')
        }
      ];

      // Gaps available: 9:00 - 9:45 (45 mins), 10:15 - 11:00 (45 mins) -> Total 90 mins
      const plan = planSchedule({
        title: 'Study React',
        durationMinutes: 80,
        windowStart,
        windowEnd,
        busy,
        conflictStrategy: 'split',
        minSessionMinutes: 30
      });

      expect(plan.strategyUsed).toBe('split');
      expect(plan.scheduledMinutes).toBe(80);
      expect(plan.sessions).toHaveLength(2);
    });

    it('should shorten to light practice when duration cannot be split or fitted', () => {
      const busy = [
        {
          start: new Date('2026-08-25T09:40:00.000Z'),
          end: new Date('2026-08-25T17:00:00.000Z')
        }
      ];

      // Only 40 minutes available at start of window
      const plan = planSchedule({
        title: 'Workout',
        durationMinutes: 60,
        windowStart,
        windowEnd,
        busy,
        conflictStrategy: 'shorten',
        minSessionMinutes: 30,
        allowLightPractice: true
      });

      expect(plan.strategyUsed).toBe('shorten');
      expect(plan.scheduledMinutes).toBe(40);
      expect(plan.sessions[0].lightPractice).toBe(true);
      expect(plan.sessions[0].summarySuffix).toBe('Light Practice');
    });
  });
});
