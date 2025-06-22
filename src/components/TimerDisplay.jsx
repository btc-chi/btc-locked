import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { formatDisplayTime, parseTime } from '../utils/time';

export default function TimerDisplay() {
  const { formattedTime, currentDuration, updateDuration, isRunning, isFullscreen, startTimer, pauseTimer } = useTimer();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             ('ontouchstart' in window) ||
                             (window.innerWidth <= 768);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleEdit = () => {
    if (isRunning) return; // Don't allow editing while running
    setIsEditing(true);
    setEditValue(formatDisplayTime(currentDuration));
  };
  
  const handleSave = () => {
    const newDuration = parseTime(editValue);
    if (newDuration > 0) {
      updateDuration(newDuration);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  const handleTimerTap = () => {
    if (isMobile && !isEditing) {
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
  };
  
  return (
    <div className="timer-display">
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="timer-time-input"
          autoFocus
          placeholder="60 or 30s"
        />
      ) : (
        <div
          onClick={isMobile ? handleTimerTap : handleEdit}
          className={`timer-time ${!isRunning || isMobile ? 'timer-time-clickable' : ''} ${isRunning ? 'running' : ''}`}
          style={isRunning && !isMobile ? { cursor: 'default' } : {}}
        >
          {formattedTime}
        </div>
      )}
      
      {!isFullscreen && !isEditing && !isRunning && (
        <div 
          className={`timer-hint ${!isMobile ? 'timer-hint-clickable' : ''}`}
          onClick={!isMobile ? startTimer : undefined}
        >
          {isMobile ? 'TAP TO START' : 'SPACEBAR TO START'}
        </div>
      )}
      
      {!isFullscreen && isEditing && (
        <div className="timer-hint">
          MINUTES: 60 • SECONDS: 30s • ENTER TO SAVE • ESC TO CANCEL
        </div>
      )}
      
      {!isFullscreen && isRunning && (
        <div 
          className={`timer-hint ${!isMobile ? 'timer-hint-clickable' : ''}`}
          onClick={!isMobile ? pauseTimer : undefined}
        >
          {isMobile ? 'TAP TO PAUSE • R TO RESET' : 'SPACEBAR TO PAUSE • R TO RESET'}
        </div>
      )}
    </div>
  );
} 