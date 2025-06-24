import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { getPastWeekDates, getDateKey, getDailyHeatmapColor, formatHours, getDayAbbreviation } from '../utils/time';
import DailyStats from './DailyStats';

export default function HeatmapGrid() {
  const { workTimeHistory, restTimeHistory } = useTimer();
  const [viewMode, setViewMode] = useState('work'); // 'work' or 'rest'
  const weekDates = getPastWeekDates();
  
  // Choose which history to display
  const currentHistory = viewMode === 'work' ? workTimeHistory : restTimeHistory;
  
  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">
        TIME SPENT DEEP
        <DailyStats />
      </h3>
      
      <div className="weekly-heatmap-grid">
        {weekDates.map((date, index) => {
          const dateKey = getDateKey(date);
          const totalMinutes = currentHistory[dateKey] || 0;
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
              <div className="day-time">{formatHours(totalMinutes)}</div>
            </div>
          );
        })}
      </div>
      
      {/* Toggle between work and rest - moved below grid */}
      <div className="heatmap-toggle-subtle">
        <button
          onClick={() => setViewMode('work')}
          className={`heatmap-toggle-btn-subtle ${viewMode === 'work' ? 'active' : 'inactive'}`}
        >
          work
        </button>
        <span className="toggle-separator">•</span>
        <button
          onClick={() => setViewMode('rest')}
          className={`heatmap-toggle-btn-subtle ${viewMode === 'rest' ? 'active' : 'inactive'}`}
        >
          rest
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
    </div>
  );
} 