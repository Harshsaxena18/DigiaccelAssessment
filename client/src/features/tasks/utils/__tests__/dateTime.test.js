import { describe, it, expect } from 'vitest';
import {
  startOfWeekMonday,
  endOfWeekSunday,
  startOfNextWeekMonday,
  formatWeekRange,
  toDateTimeLocalValue,
  fromDateTimeLocalValue,
  getDaysOfWeek,
} from '../dateTime.js';

describe('Date & Time Utilities', () => {
  it('startOfWeekMonday returns Monday at 00:00:00 for mid-week date', () => {
    // 2026-11-04 is Wednesday
    const wednesday = new Date(2026, 10, 4, 15, 30);
    const monday = startOfWeekMonday(wednesday);

    expect(monday.getDay()).toBe(1); // 1 = Monday
    expect(monday.getDate()).toBe(2); // Monday was Nov 2
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it('startOfWeekMonday on Monday returns the same Monday', () => {
    const mondayMorning = new Date(2026, 10, 2, 8, 0);
    const monday = startOfWeekMonday(mondayMorning);

    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(2);
  });

  it('Sunday belongs to the week ending on that Sunday', () => {
    // 2026-11-08 is Sunday
    const sundayNight = new Date(2026, 10, 8, 23, 59, 59);
    const monday = startOfWeekMonday(sundayNight);

    expect(monday.getDate()).toBe(2); // Should still be Monday Nov 2
  });

  it('Next Monday 00:00:00 is exactly startOfNextWeekMonday', () => {
    const wednesday = new Date(2026, 10, 4, 12, 0);
    const nextMonday = startOfNextWeekMonday(wednesday);

    expect(nextMonday.getDay()).toBe(1);
    expect(nextMonday.getDate()).toBe(9); // Next Monday Nov 9
    expect(nextMonday.getHours()).toBe(0);
  });

  it('getDaysOfWeek returns exactly 7 days starting with Monday', () => {
    const monday = new Date(2026, 10, 2);
    const days = getDaysOfWeek(monday);

    expect(days).toHaveLength(7);
    expect(days[0].dayName).toBe('Mon');
    expect(days[6].dayName).toBe('Sun');
  });

  it('formatWeekRange formats range properly', () => {
    const monday = new Date(2026, 9, 26);
    const sunday = new Date(2026, 10, 1);
    const formatted = formatWeekRange(monday, sunday);

    expect(formatted).toContain('26 Oct');
    expect(formatted).toContain('01 Nov 2026');
  });

  it('toDateTimeLocalValue and fromDateTimeLocalValue round-trip cleanly', () => {
    const originalDate = new Date(2026, 10, 4, 14, 30, 0);
    const localString = toDateTimeLocalValue(originalDate);

    expect(localString).toBe('2026-11-04T14:30');

    const iso = fromDateTimeLocalValue(localString);
    const parsed = new Date(iso);

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(4);
    expect(parsed.getHours()).toBe(14);
    expect(parsed.getMinutes()).toBe(30);
  });
});
