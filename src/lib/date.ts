import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

/**
 * Format a date for display (e.g., "Mon, Dec 25, 2024")
 */
export function formatDate(date: Date): string {
  return format(date, "EEE, MMM d, yyyy");
}

/**
 * Format time (e.g., "10:00 AM")
 */
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * Format a date range (e.g., "10:00 AM - 11:00 AM")
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format date with relative description
 * e.g., "Today at 10:00 AM", "Tomorrow at 2:00 PM", "Mon, Dec 25 at 3:00 PM"
 */
export function formatDateTimeRelative(date: Date): string {
  const time = formatTime(date);

  if (isToday(date)) {
    return `Today at ${time}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${time}`;
  }

  return `${format(date, "EEE, MMM d")} at ${time}`;
}

/**
 * Format relative time (e.g., "in 2 hours", "3 days ago")
 */
export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
