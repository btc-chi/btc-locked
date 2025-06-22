import React from 'react';
import { useTimer } from '../context/TimerContext';
import TimerTabs from './TimerTabs';
import TimerDisplay from './TimerDisplay';
import HeatmapGrid from './HeatmapGrid';

export default function AppShell() {
  const { toggleFullscreen, isFullscreen, isRunning } = useTimer();
  
  return (
    <div className="container">
      {/* Fullscreen toggle/exit button */}
      <button
        onClick={toggleFullscreen}
        className="fullscreen-btn"
        title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
      >
        {isFullscreen ? (
          // X icon for exit
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Fullscreen icon
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6"/>
            <path d="M9 21H3v-6"/>
            <path d="M21 3l-7 7"/>
            <path d="M3 21l7-7"/>
          </svg>
        )}
      </button>
      
      {/* Main content */}
      <div className="main-content">
        <div className="timer-wrapper">
          {isFullscreen ? (
            // Fullscreen mode: Only show timer
            <div className="fullscreen-timer">
              <TimerDisplay />
              {/* Subtle controls hint in fullscreen */}
              <div className="timer-hint" style={{ position: 'absolute', bottom: '40px', textAlign: 'center' }}>
                {isRunning ? 'SPACEBAR TO PAUSE • R TO RESET' : 'SPACEBAR TO START • R TO RESET'}
              </div>
            </div>
          ) : (
            // Normal mode: Clean minimal layout
            <>
              {/* Timer section */}
              <div className="timer-section">
                <TimerTabs />
                <TimerDisplay />
              </div>
              
              {/* Heatmap section */}
              <HeatmapGrid />
              
              {/* Keyboard shortcuts hint */}
              <div className="keyboard-hint">
                SPACEBAR: Start/Pause • R: Reset • F: Fullscreen
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 