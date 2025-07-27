import React, { useState } from 'react';
import Board from './Board/Board';
import Dice from './Dice/Dice';
import NetworkManager from './NetworkManager/NetworkManager';
import NetworkDebugger from './NetworkDebugger/NetworkDebugger';
import AudioPlayer from './AudioPlayer/AudioPlayer';
import { useGameSelectors, useGameActions } from '../store';
import './LudoGame.css';
import { NETWORK_MODE, AVAILABLE_COLORS } from '../store/gameTypes';

const LudoGame = () => {
  // Local state for color selection mode
  const [showColorSelection, setShowColorSelection] = useState(false);
  
  // Use the new state management hooks
  const {
    isGameStarted,
    selectedPlayerCount,
    selectedColors,
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
    setPlayerColors,
    rollDice,
    getPlayersForPreview
  } = useGameActions();

  // Color selection functions
  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    setShowColorSelection(false); // Reset color selection when player count changes
  };

  const handleColorChange = (playerIndex, newColor) => {
    const newColors = [...selectedColors];
    newColors[playerIndex] = newColor;
    setPlayerColors(newColors);
  };

  const getAvailableColors = (currentPlayerIndex) => {
    // Get colors not used by other players
    return AVAILABLE_COLORS.filter(color => 
      !selectedColors.includes(color.id) || selectedColors[currentPlayerIndex] === color.id
    );
  };

  const canCustomizeColors = () => {
    return selectedPlayerCount < 4; // Allow color customization for 2-3 player games
  };

  const isDefaultColorSelection = () => {
    const defaultColors = {
      2: ['red', 'yellow'],
      3: ['red', 'blue', 'yellow'],
      4: ['red', 'blue', 'yellow', 'green']
    };
    const defaultForCount = defaultColors[selectedPlayerCount] || defaultColors[4];
    return JSON.stringify(selectedColors.slice(0, selectedPlayerCount)) === JSON.stringify(defaultForCount);
  };

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
        <AudioPlayer />
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
                onClick={() => handlePlayerCountChange(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
          
          {/* Color customization section */}
          {canCustomizeColors() && (
            <div className="color-customization">
              <div className="color-customization-header">
                <h3>Player Colors{!isDefaultColorSelection() ? ' (Customized)' : ''}</h3>
                <button 
                  className="customize-colors-btn"
                  onClick={() => setShowColorSelection(!showColorSelection)}
                >
                  {showColorSelection ? 'Hide Color Options' : 'Customize Colors'}
                </button>
              </div>
              
              {showColorSelection && (
                <div className="color-selection-grid">
                  {selectedColors.slice(0, selectedPlayerCount).map((selectedColor, playerIndex) => (
                    <div key={playerIndex} className="player-color-selector">
                      <h4>Player {playerIndex + 1}</h4>
                      <div className="color-options">
                        {getAvailableColors(playerIndex).map(color => (
                          <button
                            key={color.id}
                            className={`color-option ${selectedColor === color.id ? 'selected' : ''}`}
                            style={{ backgroundColor: color.bgColor }}
                            onClick={() => handleColorChange(playerIndex, color.id)}
                            title={color.name}
                          >
                            {selectedColor === color.id && '✓'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
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
      <AudioPlayer />
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
