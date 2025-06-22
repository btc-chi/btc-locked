import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { formatDisplayTime, parseTime } from '../utils/time';

export default function TimerDisplay() {
  const { formattedTime, currentDuration, updateDuration, isRunning, isFullscreen } = useTimer();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
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
  
  return (
    <div className="timer-display">
      {isEditing ? (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="timer-time-input"
          autoFocus
          min="1"
          max="999"
          placeholder="60"
        />
      ) : (
        <div
          onClick={handleEdit}
          className={`timer-time ${!isRunning ? 'timer-time-clickable' : ''} ${isRunning ? 'running' : ''}`}
          style={isRunning ? { cursor: 'default' } : {}}
        >
          {formattedTime}
        </div>
      )}
      
      {!isFullscreen && !isEditing && !isRunning && (
        <div className="timer-hint">
          CLICK TO EDIT
        </div>
      )}
      
      {!isFullscreen && isEditing && (
        <div className="timer-hint">
          ENTER TO SAVE • ESC TO CANCEL
        </div>
      )}
      
      {!isFullscreen && isRunning && (
        <div className="timer-hint">
          SPACEBAR TO PAUSE • R TO RESET • F FOR FULLSCREEN
        </div>
      )}
    </div>
  );
} 