import React from 'react';
import { useTimer } from '../context/TimerContext';

export default function SuccessScreen() {
  const { showSuccess, successMessage, completedMode, handleSuccessAction } = useTimer();
  
  if (!showSuccess) return null;
  
  // Determine button text based on completed mode
  const wasWorkSession = completedMode === 'work';
  
  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="success-message">
          {successMessage}
        </div>
        <div className="success-actions">
          <button 
            className="success-btn success-btn-primary"
            onClick={() => handleSuccessAction('switch')}
          >
            {wasWorkSession ? 'Thanks, break time' : "Let's keep locking in"}
          </button>
          <button 
            className="success-btn success-btn-secondary"
            onClick={() => handleSuccessAction('continue')}
          >
            {wasWorkSession ? 'Keep working' : 'Extend break'}
          </button>
        </div>
      </div>
    </div>
  );
} 