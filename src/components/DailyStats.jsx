import React, { useState, useMemo } from 'react';
import { useTimer } from '../context/TimerContext';
import { 
  getDateRange, 
  getTotalMinutesForDateRange, 
  calculatePercentageChange, 
  formatHours 
} from '../utils/time';

export default function DailyStats() {
  const { workTimeHistory, restTimeHistory } = useTimer();
  const [isVisible, setIsVisible] = useState(false);

  // Calculate comparative analytics
  const comparativeStats = useMemo(() => {
    // Combine work and rest time for total deep work analytics
    const combinedHistory = {};
    
    // Combine work time
    Object.keys(workTimeHistory).forEach(date => {
      combinedHistory[date] = (combinedHistory[date] || 0) + workTimeHistory[date];
    });
    
    // Add rest time
    Object.keys(restTimeHistory).forEach(date => {
      combinedHistory[date] = (combinedHistory[date] || 0) + restTimeHistory[date];
    });
    
    // Convert to old format for compatibility with existing functions
    const timeHistory = {};
    Object.keys(combinedHistory).forEach(date => {
      timeHistory[date] = { 0: combinedHistory[date] }; // Put all minutes in slot 0
    });
    
    // Get current periods
    const todayMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('today'));
    const thisWeekMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('thisWeek'));
    const thisMonthMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('thisMonth'));
    const thisYearMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('thisYear'));
    
    // Get previous periods for comparison
    const yesterdayMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('yesterday'));
    const lastWeekMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('lastWeek'));
    const lastMonthMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('lastMonth'));
    const lastYearMinutes = getTotalMinutesForDateRange(timeHistory, getDateRange('lastYear'));
    
    // Calculate all-time total
    let allTimeMinutes = 0;
    Object.keys(timeHistory).forEach(date => {
      const dayData = timeHistory[date] || {};
      Object.values(dayData).forEach(minutes => {
        allTimeMinutes += minutes || 0;
      });
    });

    return {
      today: {
        current: todayMinutes,
        formatted: formatHours(todayMinutes),
        change: calculatePercentageChange(todayMinutes, yesterdayMinutes)
      },
      thisWeek: {
        current: thisWeekMinutes,
        formatted: formatHours(thisWeekMinutes),
        change: calculatePercentageChange(thisWeekMinutes, lastWeekMinutes)
      },
      thisMonth: {
        current: thisMonthMinutes,
        formatted: formatHours(thisMonthMinutes),
        change: calculatePercentageChange(thisMonthMinutes, lastMonthMinutes)
      },
      thisYear: {
        current: thisYearMinutes,
        formatted: formatHours(thisYearMinutes),
        change: calculatePercentageChange(thisYearMinutes, lastYearMinutes)
      },
      allTime: {
        current: allTimeMinutes,
        formatted: formatHours(allTimeMinutes)
      }
    };
  }, [workTimeHistory, restTimeHistory]);

  // Helper function to format percentage change with colors
  const formatChange = (change) => {
    if (change === '0') return <span style={{ opacity: 0.5 }}>({change}%)</span>;
    const color = change.startsWith('+') ? '#4ade80' : '#f87171'; // Green for positive, red for negative
    return <span style={{ color, fontWeight: '500' }}>({change}%)</span>;
  };

  return (
    <div className={`daily-stats ${isVisible ? 'active' : ''}`}>
      <button
        className="daily-stats-trigger"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        title="View deep work analytics"
      >
        STATS
      </button>
      <div className="daily-stats-tooltip">
        <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '0.9em' }}>
          📊 Deep Work Analytics
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>Today:</strong> {comparativeStats.today.formatted} {formatChange(comparativeStats.today.change)}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>This Week:</strong> {comparativeStats.thisWeek.formatted} {formatChange(comparativeStats.thisWeek.change)}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>This Month:</strong> {comparativeStats.thisMonth.formatted} {formatChange(comparativeStats.thisMonth.change)}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>This Year:</strong> {comparativeStats.thisYear.formatted} {formatChange(comparativeStats.thisYear.change)}
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: '8px', marginTop: '8px' }}>
          <strong>All Time:</strong> {comparativeStats.allTime.formatted}
        </div>
        
        {comparativeStats.allTime.current === 0 && (
          <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '8px', fontStyle: 'italic' }}>
            Start your first session to see comparative analytics
          </div>
        )}
      </div>
    </div>
  );
} 