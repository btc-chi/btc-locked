import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { getWeekDates, getDateKey, getDailyHeatmapColor, formatHours, getDayAbbreviation } from '../utils/time';
import DailyStats from './DailyStats';

export default function HeatmapGrid() {
  const { workTimeHistory, restTimeHistory } = useTimer();
  const [viewMode, setViewMode] = useState('work'); // 'work' or 'rest'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const weekDates = getWeekDates(weekOffset);
  
  // Choose which history to display
  const currentHistory = viewMode === 'work' ? workTimeHistory : restTimeHistory;
  
  // Navigation functions
  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);
  const goToCurrentWeek = () => setWeekOffset(0);
  
  // Week description
  const getWeekDescription = () => {
    if (weekOffset === 0) return '';
    if (weekOffset === -1) return 'Last week';
    if (weekOffset === 1) return 'Next week';
    if (weekOffset < -1) return `${Math.abs(weekOffset)} weeks ago`;
    return `${weekOffset} weeks ahead`;
  };
  
  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">
        TIME SPENT DEEP
        <DailyStats />
      </h3>
      
      {/* Week info section */}
      {getWeekDescription() && (
        <div className="week-description-bar">
          <div className="week-description">
            {getWeekDescription()}
            {weekOffset !== 0 && (
              <button onClick={goToCurrentWeek} className="today-btn" title="Go to current week">
                Today
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Week navigation integrated with heatmap */}
      <div className="weekly-heatmap-with-nav">
        {/* Left arrow */}
        <button 
          onClick={goToPreviousWeek}
          className="week-nav-btn inline"
          title="Previous week"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        {/* Week days */}
        <div className="weekly-heatmap-grid">
          {weekDates.map((date, index) => {
            const dateKey = getDateKey(date);
            const totalMinutes = Object.values(currentHistory[dateKey] || {}).reduce((sum, minutes) => sum + (minutes || 0), 0);
            const colorClass = getDailyHeatmapColor(totalMinutes);
            const dayAbbrev = getDayAbbreviation(date);
            const isToday = dateKey === getDateKey(new Date());
            
            return (
              <div key={index} className="weekly-heatmap-day">
                <div className="day-label">{dayAbbrev}</div>
                <div
                  className={`weekly-heatmap-cell ${colorClass} ${isToday ? 'today' : ''}`}
                  title={`${date.toLocaleDateString()}: ${formatHours(totalMinutes)} ${viewMode} time`}
                />
                <div className="day-date">{date.getMonth() + 1}/{date.getDate()}</div>
                <div className="day-time">{totalMinutes > 0 ? formatHours(totalMinutes) : ''}</div>
              </div>
            );
          })}
        </div>
        
        {/* Right arrow */}
        <button 
          onClick={goToNextWeek}
          className="week-nav-btn inline"
          title="Next week"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-scale">
          <div className="legend-cell bg-gray-900 border-gray-800"></div>
          <div className="legend-cell bg-gray-700 border-gray-600"></div>
          <div className="legend-cell bg-gray-500 border-gray-400"></div>
          <div className="legend-cell bg-gray-300 border-gray-200"></div>
          <div className="legend-cell bg-white border-gray-100"></div>
        </div>
        <span>More</span>
      </div>
      
      {/* Toggle between work and rest - moved below legend */}
      <div className="heatmap-toggle-subtle">
        <button
          onClick={() => setViewMode('work')}
          className={`heatmap-toggle-btn-subtle ${viewMode === 'work' ? 'active' : 'inactive'}`}
        >
          WORK
        </button>
        <span className="toggle-separator">•</span>
        <button
          onClick={() => setViewMode('rest')}
          className={`heatmap-toggle-btn-subtle ${viewMode === 'rest' ? 'active' : 'inactive'}`}
        >
          REST
        </button>
      </div>
    </div>
  );
} 