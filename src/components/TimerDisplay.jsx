import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { formatDisplayTime, parseTime } from '../utils/time';

export default function TimerDisplay() {
  const { formattedTime, currentDuration, updateDuration, isRunning, isPaused, isFullscreen, startTimer, pauseTimer, resumeTimer, mode } = useTimer();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [currentStatusMessage, setCurrentStatusMessage] = useState('');
  
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
      } else if (isPaused) {
        resumeTimer();
      } else {
        startTimer();
      }
    }
  };
  
  // Generate random status message only when entering fullscreen
  const generateRandomStatus = () => {
    const workMessages = [
      'locked-in', 'focusing', 'dialed', 'working', 'hustling',
      'in the zone', 'flow state', 'grinding', 'building', 'creating',
      'deep work', 'laser focus', 'beast mode', 'crushing it', 'momentum',
      'no distractions', 'pure focus', 'locked & loaded', 'getting after it'
    ];
    const restMessages = [
      'resting', 'chillin\'', 'vibing', 'coolin\'', 'recharging', 'gaming',
      'decompressing', 'brain break', 'reset mode', 'breathing', 'restoring',
      'mind wandering', 'power nap', 'reboot time', 'zen mode', 'unplugged',
      'battery charging', 'mental break', 'restoration', 'inner peace'
    ];
    
    const messages = mode === 'work' ? workMessages : restMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Update status message only when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      setCurrentStatusMessage(generateRandomStatus());
    }
  }, [isFullscreen, mode]);

  return (
    <div className="timer-display">
      {/* Status label for fullscreen mode - moved to top left */}
      {isFullscreen && !isEditing && (
        <div className="timer-status-label-topleft">
          // {currentStatusMessage}
        </div>
      )}
      
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
      
      {!isFullscreen && !isEditing && !isRunning && !isPaused && (
        <div 
          className={`timer-hint ${!isMobile ? 'timer-hint-clickable' : ''}`}
          onClick={!isMobile ? startTimer : handleTimerTap}
        >
          {isMobile ? 'TAP TO START' : 'SPACEBAR TO START'}
        </div>
      )}

      {!isFullscreen && !isEditing && isPaused && (
        <div 
          className={`timer-hint ${!isMobile ? 'timer-hint-clickable' : ''}`}
          onClick={!isMobile ? resumeTimer : handleTimerTap}
        >
          {isMobile ? 'TAP TO RESUME' : 'SPACEBAR TO RESUME'}
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