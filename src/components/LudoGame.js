import React, { useState, useEffect } from 'react';
import Board from './Board/Board';
import Dice from './Dice/Dice';
import NetworkManager from './NetworkManager/NetworkManager';
import NetworkDebugger from './NetworkDebugger/NetworkDebugger';
import AudioPlayer from './AudioPlayer/AudioPlayer';
import { useGameSelectors, useGameActions } from '../store';
import './LudoGame.css';
import { NETWORK_MODE, PLAYER_CONFIGS } from '../store/gameTypes';

const ALL_COLORS = [
  { id: 0, color: 'red', name: 'Red' },
  { id: 1, color: 'blue', name: 'Blue' },
  { id: 2, color: 'yellow', name: 'Yellow' },
  { id: 3, color: 'green', name: 'Green' }
];

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

  // State for color selection
  const [selectedColors, setSelectedColors] = useState([]);
  
  // Initialize selected colors when player count changes
  useEffect(() => {
    if (selectedPlayerCount < 4) {
      // Default to first N colors if less than 4 players
      const defaultColors = PLAYER_CONFIGS[selectedPlayerCount] || [];
      setSelectedColors(defaultColors.map(p => p.color));
    } else {
      setSelectedColors(['red', 'blue', 'yellow', 'green']);
    }
  }, [selectedPlayerCount]);

  // Handle color selection toggle
  const toggleColorSelection = (color) => {
    if (selectedPlayerCount >= 4) return; // No selection needed for 4 players
    
    const isSelected = selectedColors.includes(color);
    
    if (isSelected) {
      // Allow deselecting to swap colors - remove from current position
      const newColors = selectedColors.filter(c => c !== color);
      setSelectedColors(newColors);
    } else {
      // Add color based on current selection count
      if (selectedColors.length < selectedPlayerCount) {
        // Add to the list if we haven't reached the limit
        setSelectedColors([...selectedColors, color]);
      } else {
        // We're at the limit, replace the last selected color
        setSelectedColors([...selectedColors.slice(0, -1), color]);
      }
    }
  };

  // Get player config based on selected colors
  const getCustomPlayerConfig = () => {
    if (selectedPlayerCount >= 4) {
      return PLAYER_CONFIGS[4];
    }
    
    return selectedColors.map((color, index) => {
      const colorConfig = ALL_COLORS.find(c => c.color === color);
      return {
        id: index,
        color: colorConfig.color,
        name: colorConfig.name
      };
    });
  };

  // Check if we can start the game
  const canStartGame = () => {
    return selectedColors.length === selectedPlayerCount;
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
                onClick={() => setPlayerCount(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
          
          <div className="player-preview">
            <h3>Players in {selectedPlayerCount}-player game:</h3>
            
            {selectedPlayerCount < 4 && (
              <div className="color-selection">
                <p className="color-selection-hint">
                  Select {selectedPlayerCount} colors for the game:
                </p>
                <div className="color-options">
                  {ALL_COLORS.map((colorConfig) => {
                    const isSelected = selectedColors.includes(colorConfig.color);
                    const selectionOrder = selectedColors.indexOf(colorConfig.color) + 1;
                    
                    return (
                      <button
                        key={colorConfig.color}
                        className={`color-option player-${colorConfig.color} ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleColorSelection(colorConfig.color)}
                        title={`${colorConfig.name}${isSelected ? ` (Player ${selectionOrder})` : ''}`}
                      >
                        <span className="color-name">{colorConfig.name}</span>
                        {isSelected && <span className="selection-badge">{selectionOrder}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="preview-players">
              {getCustomPlayerConfig().map((player, index) => (
                <div key={index} className={`preview-player player-${player.color}`}>
                  Player {index + 1}: {player.name}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="start-game-btn"
            onClick={() => startGame(selectedPlayerCount, getCustomPlayerConfig())}
            disabled={!canStartGame()}
          >
            {canStartGame() 
              ? `Start Game with ${selectedPlayerCount} Players`
              : `Select ${selectedPlayerCount - selectedColors.length} more color${selectedPlayerCount - selectedColors.length > 1 ? 's' : ''}`
            }
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
