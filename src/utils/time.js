// Format time in MM:SS format
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format time for display (e.g., "60" for 60 minutes, "30s" for 30 seconds)
export function formatDisplayTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return Math.ceil(seconds / 60).toString();
}

// Parse time input (supports both "60" for minutes and "30s" for seconds)
export function parseTime(input) {
  const str = input.toString().toLowerCase().trim();
  
  // Check if input ends with 's' for seconds
  if (str.endsWith('s')) {
    const seconds = parseInt(str.slice(0, -1), 10);
    return isNaN(seconds) ? 0 : Math.max(1, seconds); // Minimum 1 second
  }
  
  // Default to minutes
  const minutes = parseInt(str, 10);
  return isNaN(minutes) ? 0 : Math.max(60, minutes * 60); // Minimum 1 minute for minute input
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

// Get week dates with offset (0 = current week, -1 = last week, 1 = next week)
export function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to go back to get to Monday
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  // Get Monday of the target week
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday + (weekOffset * 7));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Get past 7 days for heatmap starting from Monday (backward compatibility)
export function getPastWeekDates() {
  return getWeekDates(0);
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

// Format minutes as hours with decimals (e.g., "2.5h")
export function formatHours(minutes) {
  if (minutes === 0) return '0h';
  const hours = minutes / 60;
  if (hours < 0.1) return '0.1h'; // Show minimum of 0.1h for any time
  return `${hours.toFixed(1)}h`;
}

// Get date range for different periods
export function getDateRange(period, referenceDate = new Date()) {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);
  
  switch (period) {
    case 'today':
      // Today only
      return [getDateKey(start)];
      
    case 'yesterday':
      // Yesterday only
      start.setDate(start.getDate() - 1);
      return [getDateKey(start)];
      
    case 'thisWeek':
      // This week (Monday to Sunday)
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
      start.setDate(start.getDate() - mondayOffset);
      end.setDate(start.getDate() + 6);
      break;
      
    case 'lastWeek':
      // Last week (Monday to Sunday)
      const lastWeekDayOfWeek = start.getDay();
      const lastWeekMondayOffset = lastWeekDayOfWeek === 0 ? 6 : lastWeekDayOfWeek - 1;
      start.setDate(start.getDate() - lastWeekMondayOffset - 7);
      end.setDate(start.getDate() + 6);
      break;
      
    case 'thisMonth':
      // This month (1st to last day)
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0); // Last day of current month
      break;
      
    case 'lastMonth':
      // Last month (1st to last day)
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0); // Last day of last month
      break;
      
    case 'thisYear':
      // This year (Jan 1 to Dec 31)
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
      
    case 'lastYear':
      // Last year (Jan 1 to Dec 31)
      start.setFullYear(start.getFullYear() - 1, 0, 1);
      end.setFullYear(end.getFullYear() - 1, 11, 31);
      break;
      
    default:
      return [];
  }
  
  // Generate array of date keys
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(getDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Calculate total minutes for a date range
export function getTotalMinutesForDateRange(timeHistory, dateKeys) {
  let total = 0;
  dateKeys.forEach(dateKey => {
    const dayData = timeHistory[dateKey] || {};
    Object.values(dayData).forEach(minutes => {
      total += minutes || 0;
    });
  });
  return total;
}

// Calculate percentage change
export function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? '+∞' : '0';
  }
  const change = ((current - previous) / previous) * 100;
  if (change > 0) {
    return `+${Math.round(change)}`;
  } else if (change < 0) {
    return `${Math.round(change)}`;
  } else {
    return '0';
  }
}

// Calculate daily color intensity for simplified weekly heatmap based on hours logged
export function getDailyHeatmapColor(totalMinutes, maxTargetHours = 8) {
  const maxMinutes = maxTargetHours * 60;
  
  if (totalMinutes === 0) return 'bg-gray-900 border-gray-800';
  if (totalMinutes <= maxMinutes * 0.2) return 'bg-gray-700 border-gray-600'; // 0-20%
  if (totalMinutes <= maxMinutes * 0.4) return 'bg-gray-500 border-gray-400'; // 20-40%
  if (totalMinutes <= maxMinutes * 0.7) return 'bg-gray-300 border-gray-200'; // 40-70%
  return 'bg-white border-gray-100'; // 70%+
}

// Get day name abbreviation
export function getDayAbbreviation(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
} 