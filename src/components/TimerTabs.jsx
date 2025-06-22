import React from 'react';
import { useTimer } from '../context/TimerContext';

export default function TimerTabs() {
  const { mode, switchMode } = useTimer();
  
  return (
    <div className="tabs-container">
      <button
        onClick={() => switchMode('work')}
        className={`terminal-tab ${mode === 'work' ? 'active' : 'inactive'}`}
      >
        WORK
      </button>
      <button
        onClick={() => switchMode('rest')}
        className={`terminal-tab ${mode === 'rest' ? 'active' : 'inactive'}`}
      >
        REST
      </button>
    </div>
  );
} 