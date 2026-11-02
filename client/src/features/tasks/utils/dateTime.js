import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  format,
  parseISO,
  isValid,
  isSameDay,
  isToday,
} from 'date-fns';

/**
 * Returns Monday at 00:00:00 of the week containing the given date
 */
export const startOfWeekMonday = (date = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return startOfWeek(d, { weekStartsOn: 1 });
};

/**
 * Returns Sunday at 23:59:59.999 of the week containing the given date
 */
export const endOfWeekSunday = (date = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return endOfWeek(d, { weekStartsOn: 1 });
};

/**
 * Returns the next Monday 00:00:00 (exclusive upper bound)
 */
export const startOfNextWeekMonday = (date = new Date()) => {
  const monday = startOfWeekMonday(date);
  return addWeeks(monday, 1);
};

/**
 * Returns the 7 days of the week starting from Monday
 */
export const getDaysOfWeek = (monday = startOfWeekMonday()) => {
  return Array.from({ length: 7 }, (_, i) => {
    const dayDate = addDays(monday, i);
    return {
      date: dayDate,
      dayName: format(dayDate, 'EEE'), // Mon, Tue, etc.
      dayNumber: format(dayDate, 'dd'), // 09, 10, etc.
      isToday: isToday(dayDate),
      isoString: dayDate.toISOString(),
    };
  });
};

/**
 * Formats a week range, e.g. "26 Oct – 01 Nov 2026"
 */
export const formatWeekRange = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start)) return '';

  const actualEnd = end && isValid(end) ? end : endOfWeekSunday(start);

  if (start.getFullYear() === actualEnd.getFullYear()) {
    return `${format(start, 'dd MMM')} – ${format(actualEnd, 'dd MMM yyyy')}`;
  }
  return `${format(start, 'dd MMM yyyy')} – ${format(actualEnd, 'dd MMM yyyy')}`;
};

/**
 * Converts a UTC Date or ISO string into local `YYYY-MM-DDTHH:mm` format for `<input type="datetime-local">`
 */
export const toDateTimeLocalValue = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Converts a local `YYYY-MM-DDTHH:mm` value into a valid ISO string in UTC
 */
export const fromDateTimeLocalValue = (localValue) => {
  if (!localValue) return null;
  const d = new Date(localValue);
  return isValid(d) ? d.toISOString() : null;
};

/**
 * Formats time for task display, e.g. "10:30 AM"
 */
export const formatTaskTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'h:mm a');
};

/**
 * Formats full readable date, e.g. "Friday 14, January"
 */
export const formatTaskDateReadable = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'EEEE d, MMMM');
};

export { isSameDay, isToday };
