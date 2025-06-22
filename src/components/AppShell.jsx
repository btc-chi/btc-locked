import React from 'react';
import { useTimer } from '../context/TimerContext';
import TimerTabs from './TimerTabs';
import TimerDisplay from './TimerDisplay';
import HeatmapGrid from './HeatmapGrid';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import SuccessScreen from './SuccessScreen';
// DailyStats imported in HeatmapGrid

export default function AppShell() {
  const { toggleFullscreen, isFullscreen, isRunning, startTimer, pauseTimer } = useTimer();
  
  // Mobile tap handler for fullscreen
  const handleFullscreenTap = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
    if (isMobile) {
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
  };
  
  return (
    <div className="container">
      {/* Theme toggle */}
      <ThemeToggle />
      
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
            <div className="fullscreen-timer" onClick={handleFullscreenTap}>
              <TimerDisplay />
              {/* Subtle controls hint in fullscreen */}
              <div className="timer-hint" style={{ position: 'absolute', bottom: '40px', textAlign: 'center' }}>
                {isRunning ? 
                  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window ?
                    'TAP TO PAUSE • R TO RESET' : 'SPACEBAR TO PAUSE • R TO RESET') :
                  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window ?
                    'TAP TO START • R TO RESET' : 'SPACEBAR TO START • R TO RESET')
                }
              </div>
            </div>
          ) : (
            // Normal mode: Clean minimal layout
            <>
              {/* Timer section */}
              <div className="timer-section">
                <Logo />
                <TimerTabs />
                <TimerDisplay />
              </div>
              
              {/* Heatmap section */}
              <HeatmapGrid />
              
              {/* Keyboard shortcuts hint */}
              <div className="keyboard-hint">
                {(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window) ?
                  'TAP: Start/Pause • R: Reset • F: Fullscreen • T: Theme' :
                  'SPACEBAR: Start/Pause • R: Reset • F: Fullscreen • T: Theme'
                }
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Success Screen Overlay */}
      <SuccessScreen />
    </div>
  );
} 