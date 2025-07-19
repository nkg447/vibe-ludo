import React from 'react';
import { GameProvider } from './store';
import LudoGame from './components/LudoGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameProvider>
        <LudoGame />
      </GameProvider>
    </div>
  );
}

export default App;
