import React from 'react';
import Board from './Board/Board';
import Dice from './Dice/Dice';
import NetworkManager from './NetworkManager/NetworkManager';
import NetworkDebugger from './NetworkDebugger/NetworkDebugger';
import { useGameSelectors, useGameActions } from '../store';
import './LudoGame.css';
import { NETWORK_MODE } from '../store/gameTypes';

const LudoGame = () => {
  // Use the new state management hooks
  const {
    isGameStarted,
    selectedPlayerCount,
    numberOfPlayers,
    currentPlayer,
    diceValue,
    moveRequired,
    players: gameStatePlayers,
    winner,
    networkMode,
    isMyTurn
  } = useGameSelectors();
  
  const {
    startGame,
    restartGame,
    setPlayerCount,
    rollDice,
    getPlayersForPreview
  } = useGameActions();

  // Create a local version of getCurrentPlayerInfo for backwards compatibility
  const getCurrentPlayerInfo = () => {
    const player = gameStatePlayers[currentPlayer];
    if (!player) return { color: 'red', name: 'Red' };
    
    const colorToName = {
      red: 'Red',
      blue: 'Blue', 
      yellow: 'Yellow',
      green: 'Green'
    };
    
    return {
      color: player.color,
      name: colorToName[player.color] || 'Unknown'
    };
  };

  // Game setup screen
  if (!isGameStarted) {
    return (
      <div className="ludo-game">
        <div className="game-header">
          <h1>Ludo Game</h1>
          <p>Choose number of players to start the game</p>
        </div>
        
        {/* Network Manager for multiplayer options */}
        <NetworkManager />
        
        <div className="player-selection">
          <h2>Select Number of Players</h2>
          <div className="player-buttons">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                className={`player-count-btn ${selectedPlayerCount === num ? 'selected' : ''}`}
                onClick={() => setPlayerCount(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
          
          <div className="player-preview">
            <h3>Players in {selectedPlayerCount}-player game:</h3>
            <div className="preview-players">
              {getPlayersForPreview(selectedPlayerCount).map((player, index) => (
                <div key={index} className={`preview-player player-${player.color}`}>
                  {player.name}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="start-game-btn"
            onClick={() => startGame(selectedPlayerCount)}
          >
            Start Game with {selectedPlayerCount} Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ludo-game">
      <div className="game-header">
        <h1>Ludo Game</h1>
        <div className="game-info">
          <div className="current-player">
            Current Player: <span className={`player-${getCurrentPlayerInfo().color}`}>
              {getCurrentPlayerInfo().name}
            </span>
          </div>
          <div className="player-count">
            {numberOfPlayers} Players Game
          </div>
          <button className="restart-btn" onClick={restartGame}>
            New Game
          </button>
        </div>
      </div>
      
      <div className="game-content">
        <Board 
          gameState={{ players: gameStatePlayers }}
          currentPlayer={currentPlayer}
          diceValue={diceValue}
        />
        
        <div className="game-controls">
          <Dice 
            value={diceValue} 
            onRoll={rollDice}
            disabled={moveRequired || (networkMode !== NETWORK_MODE.LOCAL && !isMyTurn)}
          />
          <div className="player-turn">
            {getCurrentPlayerInfo().name}'s Turn
            {networkMode !== NETWORK_MODE.LOCAL && (
              <div className={`turn-indicator ${isMyTurn ? 'my-turn' : 'waiting'}`}>
                {isMyTurn ? '(Your Turn)' : '(Waiting...)'}
              </div>
            )}
            {moveRequired && <div className="move-required">Must move a piece!</div>}
            {winner !== null && (
              <div className="winner-announcement">
                🎉 {gameStatePlayers[winner]?.name} Wins! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Network Debugger for development */}
      <NetworkDebugger />
    </div>
  );
};

export default LudoGame;
