import React from 'react';
import { TimerProvider } from './context/TimerContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/AppShell';

function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <AppShell />
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App;
