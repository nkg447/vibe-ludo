import React from 'react';
import { GameProvider } from './store';
import LudoGame from './components/LudoGame';
import InstallButton from './components/InstallButton/InstallButton';
import OfflineIndicator from './components/OfflineIndicator/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';
import './App.css';

function App() {
  return (
    <div className="App">
      <OfflineIndicator />
      <GameProvider>
        <LudoGame />
      </GameProvider>
      <InstallButton />
      <UpdateNotification />
    </div>
  );
}

export default App;
