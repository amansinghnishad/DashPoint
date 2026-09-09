import { describe, it, expect } from 'vitest';

import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  dayKey,
  parseEventStartDate,
  buildMonthGrid,
  createMonthIsoRange
} from './dateUtils';

describe('dateUtils Unit Tests', () => {
  it('should calculate start and end of month', () => {
    const d = new Date(2026, 7, 15); // August 2026
    const start = startOfMonth(d);
    const end = endOfMonth(d);

    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(7);
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(7);
  });

  it('should compare same days accurately', () => {
    const d1 = new Date(2026, 7, 25, 10, 0);
    const d2 = new Date(2026, 7, 25, 18, 30);
    const d3 = new Date(2026, 7, 26, 10, 0);

    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);
  });

  it('should format dayKey YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 25);
    expect(dayKey(d)).toBe('2026-08-25');
  });

  it('should parse event start dates from strings or objects', () => {
    const fromStr = parseEventStartDate('2026-08-25');
    expect(fromStr.getFullYear()).toBe(2026);
    expect(fromStr.getMonth()).toBe(7);
    expect(fromStr.getDate()).toBe(25);

    const fromObj = parseEventStartDate({ dateTime: '2026-08-25T14:30:00.000Z' });
    expect(fromObj).toBeInstanceOf(Date);
  });

  it('should build standard 42-day calendar month grid', () => {
    const d = new Date(2026, 7, 1);
    const grid = buildMonthGrid(d);
    expect(grid).toHaveLength(42);
  });

  it('should generate ISO time range for month', () => {
    const d = new Date(2026, 7, 1);
    const range = createMonthIsoRange(d);
    expect(range.timeMin).toBeDefined();
    expect(range.timeMax).toBeDefined();
  });
});
