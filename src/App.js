import React from 'react';
import { TimerProvider } from './context/TimerContext';
import AppShell from './components/AppShell';

function App() {
  return (
    <TimerProvider>
      <AppShell />
    </TimerProvider>
  );
}

export default App;
