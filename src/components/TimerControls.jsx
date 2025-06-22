import React from 'react';
import { useTimer } from '../context/TimerContext';

export default function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer } = useTimer();
  
  return (
    <div className="controls-container">
      <button
        onClick={isRunning ? pauseTimer : startTimer}
        className="terminal-button control-btn"
      >
        {isRunning ? 'PAUSE' : 'START'}
      </button>
      
      <button
        onClick={resetTimer}
        className="terminal-button control-btn"
      >
        RESET
      </button>
    </div>
  );
} 