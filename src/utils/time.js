// Format time in MM:SS format
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format time for display (e.g., "60" for 60 minutes)
export function formatDisplayTime(seconds) {
  return Math.ceil(seconds / 60).toString();
}

// Parse time input (e.g., "60" to 3600 seconds)
export function parseTime(input) {
  const minutes = parseInt(input, 10);
  return isNaN(minutes) ? 0 : minutes * 60;
}

// Get current time slot (0-47 for 30-minute slots in a day)
export function getCurrentTimeSlot() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours * 2 + (minutes >= 30 ? 1 : 0);
}

// Get date key for storage (YYYY-MM-DD)
export function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Get day of week (0 = Sunday, 6 = Saturday)
export function getDayOfWeek(date = new Date()) {
  return date.getDay();
}

// Calculate heatmap color intensity based on minutes logged (more granular for real-time)
export function getHeatmapColor(minutes) {
  if (minutes === 0) return 'bg-gray-900 border-gray-800';
  if (minutes <= 5) return 'bg-gray-700 border-gray-600';
  if (minutes <= 15) return 'bg-gray-500 border-gray-400';
  if (minutes <= 25) return 'bg-gray-300 border-gray-200';
  return 'bg-white border-gray-100';
}

// Get past 7 days for heatmap
export function getPastWeekDates() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

// Format minutes for display (e.g., "45m" or "1h 15m")
export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
} 