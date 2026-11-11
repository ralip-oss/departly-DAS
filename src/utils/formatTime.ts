/**
 * Formats duration in minutes to human-readable string.
 * Under 60 min: "25 min"
 * 60 min and over: "1 h", "1 h 03 min", "2 h 15 min"
 */
export function formatDuration(minutes: number): string {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) {
    return '0 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} h ${String(mins).padStart(2, '0')} min` : `${hours} h`;
}
