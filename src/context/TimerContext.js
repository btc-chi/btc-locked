import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getCurrentTimeSlot, getDateKey, formatTime } from '../utils/time';

const TimerContext = createContext();

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export function TimerProvider({ children }) {
  // Timer settings
  const [mode, setMode] = useState('work'); // 'work' or 'rest'
  const [workDuration, setWorkDuration] = useState(60 * 60); // 60 minutes in seconds
  const [restDuration, setRestDuration] = useState(15 * 60); // 15 minutes in seconds
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [lastLoggedMinute, setLastLoggedMinute] = useState(0);
  
  // Data persistence
  const [timeHistory, setTimeHistory] = useLocalStorage('locked-time-history', {});
  
  // Get current duration based on mode
  const currentDuration = mode === 'work' ? workDuration : restDuration;
  
  // Subtle completion sound using Web Audio API
  const playCompletionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a subtle, calming tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Gentle frequency progression
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4); // G5
      
      oscillator.type = 'sine';
      
      // Gentle volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (error) {
      // Gracefully handle if audio context isn't available
      console.log('Audio notification not available');
    }
  }, []);
  
  // Update timeLeft when mode or duration changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(currentDuration);
      setSessionStartTime(null);
      setLastLoggedMinute(0);
    }
  }, [mode, workDuration, restDuration, currentDuration, isRunning]);
  
  // Real-time logging function that updates heatmap every minute
  const logRealtimeProgress = useCallback(() => {
    if (!isRunning || !sessionStartTime) return;
    
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    
    // Only log if we've completed a new minute
    if (elapsedMinutes > lastLoggedMinute) {
      const today = getDateKey();
      const timeSlot = getCurrentTimeSlot();
      const minutesToAdd = elapsedMinutes - lastLoggedMinute;
      
      setTimeHistory(prev => ({
        ...prev,
        [today]: {
          ...prev[today],
          [timeSlot]: (prev[today]?.[timeSlot] || 0) + minutesToAdd
        }
      }));
      
      setLastLoggedMinute(elapsedMinutes);
    }
  }, [isRunning, sessionStartTime, lastLoggedMinute, setTimeHistory]);
  
  // Real-time logging interval (every 10 seconds for smooth updates)
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(logRealtimeProgress, 10000);
      return () => clearInterval(interval);
    }
  }, [isRunning, logRealtimeProgress]);
  
  // Control functions
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setSessionStartTime(Date.now());
    setLastLoggedMinute(0);
  }, []);
  
  const pauseTimer = useCallback(() => {
    // Log final progress before pausing
    logRealtimeProgress();
    setIsRunning(false);
    setSessionStartTime(null);
    setLastLoggedMinute(0);
  }, [logRealtimeProgress]);
  
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(currentDuration);
    setSessionStartTime(null);
    setLastLoggedMinute(0);
  }, [currentDuration]);
  
  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished - log any remaining partial time and play sound
            logRealtimeProgress();
            playCompletionSound();
            setIsRunning(false);
            setSessionStartTime(null);
            setLastLoggedMinute(0);
            return currentDuration; // Reset for next session
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentDuration, logRealtimeProgress, playCompletionSound]);
  
  const switchMode = (newMode) => {
    // Log progress if switching while running
    if (isRunning) {
      logRealtimeProgress();
    }
    setIsRunning(false);
    setMode(newMode);
    setSessionStartTime(null);
    setLastLoggedMinute(0);
  };
  
  const updateDuration = (newDuration, targetMode = mode) => {
    if (targetMode === 'work') {
      setWorkDuration(newDuration);
    } else {
      setRestDuration(newDuration);
    }
    if (targetMode === mode && !isRunning) {
      setTimeLeft(newDuration);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only activate shortcuts when not editing
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (isRunning) {
            pauseTimer();
          } else {
            startTimer();
          }
          break;
        case 'r':
          e.preventDefault();
          resetTimer();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, pauseTimer, startTimer, resetTimer]);
  
  const value = {
    // State
    mode,
    timeLeft,
    isRunning,
    isFullscreen,
    workDuration,
    restDuration,
    currentDuration,
    timeHistory,
    
    // Formatted values
    formattedTime: formatTime(timeLeft),
    progress: ((currentDuration - timeLeft) / currentDuration) * 100,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    updateDuration,
    toggleFullscreen,
  };
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
} 