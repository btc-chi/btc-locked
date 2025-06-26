import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getDateKey, formatTime } from '../utils/time';

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
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [lastLoggedMinute, setLastLoggedMinute] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [completedMode, setCompletedMode] = useState(null);
  
  // Data persistence - separate work and rest tracking
  const [workTimeHistory, setWorkTimeHistory] = useLocalStorage('locked-work-time-history', {});
  const [restTimeHistory, setRestTimeHistory] = useLocalStorage('locked-rest-time-history', {});
  
  // Get current duration based on mode
  const currentDuration = mode === 'work' ? workDuration : restDuration;
  
  // Show success screen (no auto-switch)
  const showSuccessScreen = useCallback((completedMode) => {
    const workCompleteMessages = [
      "✅ Session complete",
      "🎯 Focused work done",
      "💪 Time to recharge",
      "🔥 Great job staying locked in",
      "⚡ Deep work session finished",
      "🚀 Mission accomplished",
      "🧠 Brain power well spent"
    ];
    
    const restCompleteMessages = [
      "🔋 Battery recharged",
      "✨ Ready to focus again", 
      "🌟 Refreshed and renewed",
      "💫 Break time complete",
      "🎪 Time to get back to work",
      "🎨 Creative energy restored",
      "🏃 Ready for the next sprint"
    ];
    
    const messages = completedMode === 'work' ? workCompleteMessages : restCompleteMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setSuccessMessage(randomMessage);
    setCompletedMode(completedMode);
    setShowSuccess(true);
  }, []);
  
  // Handle success screen actions
  const handleSuccessAction = useCallback((action) => {
    setShowSuccess(false);
    if (action === 'switch') {
      setMode(prevMode => prevMode === 'work' ? 'rest' : 'work');
    }
    // If action === 'continue', just close the success screen and stay in current mode
  }, []);
  
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
  
  // Update timeLeft when mode or duration changes (but not during pause)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimeLeft(currentDuration);
      setSessionStartTime(null);
      setLastLoggedMinute(0);
    }
  }, [mode, workDuration, restDuration, currentDuration, isRunning, isPaused]);
  
  // Real-time logging function that updates heatmap every minute
  const logRealtimeProgress = useCallback(() => {
    if (!isRunning || !sessionStartTime) return;
    
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    
    // Only log if we've completed a new minute
    if (elapsedMinutes > lastLoggedMinute) {
      const today = getDateKey();
      const minutesToAdd = elapsedMinutes - lastLoggedMinute;
      
      // Log to appropriate history based on current mode
      if (mode === 'work') {
        setWorkTimeHistory(prev => ({
          ...prev,
          [today]: (prev[today] || 0) + minutesToAdd
        }));
      } else {
        setRestTimeHistory(prev => ({
        ...prev,
          [today]: (prev[today] || 0) + minutesToAdd
        }));
        }
      
      setLastLoggedMinute(elapsedMinutes);
    }
  }, [isRunning, sessionStartTime, lastLoggedMinute, mode, setWorkTimeHistory, setRestTimeHistory]);
  
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
    setIsPaused(false);
    setSessionStartTime(Date.now());
    setLastLoggedMinute(0);
  }, []);
  
  const pauseTimer = useCallback(() => {
    // Log final progress before pausing
    logRealtimeProgress();
    setIsRunning(false);
    setIsPaused(true);
    // Keep session data intact for resume
  }, [logRealtimeProgress]);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    // Reset session start time to current time, adjusting for elapsed time
    const elapsed = currentDuration - timeLeft;
    setSessionStartTime(Date.now() - (elapsed * 1000));
    setLastLoggedMinute(Math.floor(elapsed / 60));
  }, [currentDuration, timeLeft]);
  
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
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
            const completedMode = mode;
            setIsRunning(false);
            setIsPaused(false);
            setSessionStartTime(null);
            setLastLoggedMinute(0);
            
            // Show success screen
            showSuccessScreen(completedMode);
            
            return currentDuration; // Reset for next session
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentDuration, logRealtimeProgress, playCompletionSound, mode, showSuccessScreen]);
  
  const switchMode = (newMode) => {
    // Log progress if switching while running
    if (isRunning) {
      logRealtimeProgress();
    }
    setIsRunning(false);
    setIsPaused(false);
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
    if (targetMode === mode && !isRunning && !isPaused) {
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
          } else if (isPaused) {
            resumeTimer();
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
  }, [isRunning, isPaused, pauseTimer, resumeTimer, startTimer, resetTimer]);
  
  const value = {
    // State
    mode,
    timeLeft,
    isRunning,
    isPaused,
    isFullscreen,
    workDuration,
    restDuration,
    currentDuration,
    workTimeHistory,
    restTimeHistory,
    showSuccess,
    successMessage,
    completedMode,
    
    // Formatted values
    formattedTime: formatTime(timeLeft),
    progress: ((currentDuration - timeLeft) / currentDuration) * 100,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    updateDuration,
    toggleFullscreen,
    handleSuccessAction,
  };
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
} 