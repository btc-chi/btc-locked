import React, { useEffect, useRef } from 'react';
import { useTimer } from '../context/TimerContext';

export default function Logo() {
  const { isRunning } = useTimer();
  const audioContextRef = useRef(null);
  
  // Play soothing & optimistic lock-in sound
  const playLockSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create a warm, uplifting chord progression
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const osc3 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a gentle, optimistic C major chord (C-E-G)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
      
      // Gentle, soothing envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      // Start all oscillators
      osc1.start(audioContext.currentTime);
      osc2.start(audioContext.currentTime + 0.02);
      osc3.start(audioContext.currentTime + 0.04);
      
      // Stop all oscillators
      osc1.stop(audioContext.currentTime + 0.8);
      osc2.stop(audioContext.currentTime + 0.8);
      osc3.stop(audioContext.currentTime + 0.8);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (error) {
      console.log('Lock sound not available');
    }
  };
  
  // Play sound when locking
  useEffect(() => {
    if (isRunning) {
      playLockSound();
    }
  }, [isRunning]);
  
  return (
    <div className="app-logo">
      <svg 
        width="28" 
        height="28" 
        viewBox="0 -2 24 26" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`lock-icon ${isRunning ? 'locked' : 'unlocked'}`}
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <circle cx="12" cy="16" r="1"/>
        {/* Shackle - simple open vs closed states */}
        {isRunning ? (
          // Closed/locked shackle
          <path 
            d="M7 11V7a5 5 0 0 1 10 0v4"
            className="lock-shackle shackle-closed"
          />
        ) : (
          // Open/unlocked shackle (simple open on right side)
          <path 
            d="M7 11V7a5 5 0 0 1 10 0"
            className="lock-shackle shackle-open"
          />
        )}
      </svg>
    </div>
  );
} 