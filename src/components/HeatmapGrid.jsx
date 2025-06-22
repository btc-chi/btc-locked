import React from 'react';
import { useTimer } from '../context/TimerContext';
import { getPastWeekDates, getDateKey, getHeatmapColor, formatMinutes } from '../utils/time';
import DailyStats from './DailyStats';

export default function HeatmapGrid() {
  const { timeHistory } = useTimer();
  const weekDates = getPastWeekDates();
  
  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">
        TIME SPENT DEEP
        <DailyStats />
      </h3>
      
      <div className="heatmap-grid">
        {weekDates.map((date, dayIndex) => {
          const dateKey = getDateKey(date);
          const dayData = timeHistory[dateKey] || {};
          
          return Array.from({ length: 48 }, (_, slotIndex) => {
            const minutes = dayData[slotIndex] || 0;
            const colorClass = getHeatmapColor(minutes);
            
            return (
              <div
                key={`${dayIndex}-${slotIndex}`}
                className={`heatmap-cell ${colorClass}`}
                title={`${date.toLocaleDateString()}, ${Math.floor(slotIndex / 2)}:${(slotIndex % 2) * 30 < 10 ? '0' : ''}${(slotIndex % 2) * 30} - ${formatMinutes(minutes)}`}
              />
            );
          });
        })}
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