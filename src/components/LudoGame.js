import React, { useState } from 'react';
import Board from './Board/Board';
import Dice from './Dice/Dice';
import './LudoGame.css';

const LudoGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [moveRequired, setMoveRequired] = useState(false);
  const [gameState, setGameState] = useState({
    players: [
      { id: 0, color: 'red', pieces: [0, 0, 0, 0] },
      { id: 1, color: 'blue', pieces: [0, 0, 0, 0] },
      { id: 2, color: 'yellow', pieces: [0, 0, 0, 0] },
      { id: 3, color: 'green', pieces: [0, 0, 0, 0] }
    ]
  });

  const playerColors = ['red', 'blue', 'yellow', 'green'];
  const playerNames = ['Red', 'Blue', 'Yellow', 'Green'];

  const startGame = (numPlayers) => {
    setNumberOfPlayers(numPlayers);
    setGameStarted(true);
    
    // Define player configurations based on number of players
    let playerConfigs = [];
    if (numPlayers === 2) {
      // 2 players: Red and Yellow (diagonal opponents)
      playerConfigs = [
        { id: 0, color: 'red' },
        { id: 2, color: 'yellow' }
      ];
    } else if (numPlayers === 3) {
      // 3 players: Red, Blue, and Yellow
      playerConfigs = [
        { id: 0, color: 'red' },
        { id: 1, color: 'blue' },
        { id: 2, color: 'yellow' }
      ];
    } else {
      // 4 players: All colors
      playerConfigs = [
        { id: 0, color: 'red' },
        { id: 1, color: 'blue' },
        { id: 2, color: 'yellow' },
        { id: 3, color: 'green' }
      ];
    }
    
    // Create players with pieces
    const players = playerConfigs.map(config => ({
      ...config,
      pieces: [0, 0, 0, 0]
    }));
    
    setGameState({ players });
    setCurrentPlayer(0);
    setDiceValue(0);
    setMoveRequired(false);
  };

  const rollDice = () => {
    // Prevent rolling if a move is required
    if (moveRequired) {
      console.log('Cannot roll dice - must move a piece first');
      return;
    }
    
    const newDiceValue = Math.floor(Math.random() * 6) + 1;
    console.log('Dice rolled:', newDiceValue, 'Current player:', currentPlayer);
    setDiceValue(newDiceValue);
    
    // Check if current player has any valid moves after rolling
    setTimeout(() => {
      const currentPlayerData = gameState.players[currentPlayer];
      if (currentPlayerData) {
        const hasValidMoves = currentPlayerData.pieces.some((position, pieceIndex) => {
          // Can move from home only with a 6
          if (position === 0) return newDiceValue === 6;
          // Can move pieces already on the board
          if (position > 0) return newDiceValue > 0;
          return false;
        });
        
        if (hasValidMoves) {
          // Player has valid moves, require them to move a piece
          console.log('Player has valid moves, requiring piece movement');
          setMoveRequired(true);
        } else {
          // No valid moves, switch to next player automatically
          console.log('No valid moves available, switching to next player');
          const nextPlayer = (currentPlayer + 1) % numberOfPlayers;
          setCurrentPlayer(nextPlayer);
          setDiceValue(0);
          setMoveRequired(false);
        }
      }
    }, 100);
  };

  const movePiece = (playerIndex, pieceIndex, newPosition) => {
    console.log('Moving piece:', { playerIndex, pieceIndex, newPosition });
    setGameState(prevState => {
      const newState = { ...prevState };
      newState.players[playerIndex].pieces[pieceIndex] = newPosition;
      console.log('New game state:', newState);
      return newState;
    });
    
    // Clear the move requirement since a piece was moved
    setMoveRequired(false);
    
    // After moving a piece, switch to next player if dice was not 6
    if (diceValue !== 6) {
      const nextPlayer = (currentPlayer + 1) % numberOfPlayers;
      console.log('Switching to next player after move:', nextPlayer);
      setCurrentPlayer(nextPlayer);
    }
    
    // Reset dice value to prevent multiple moves
    setDiceValue(0);
  };

  const restartGame = () => {
    setGameStarted(false);
    setCurrentPlayer(0);
    setDiceValue(0);
    setMoveRequired(false);
  };

  const getPlayersForPreview = (numPlayers) => {
    if (numPlayers === 2) {
      return [
        { name: 'Red', color: 'red' },
        { name: 'Yellow', color: 'yellow' }
      ];
    } else if (numPlayers === 3) {
      return [
        { name: 'Red', color: 'red' },
        { name: 'Blue', color: 'blue' },
        { name: 'Yellow', color: 'yellow' }
      ];
    } else {
      return [
        { name: 'Red', color: 'red' },
        { name: 'Blue', color: 'blue' },
        { name: 'Yellow', color: 'yellow' },
        { name: 'Green', color: 'green' }
      ];
    }
  };

  // Game setup screen
  if (!gameStarted) {
    return (
      <div className="ludo-game">
        <div className="game-header">
          <h1>Ludo Game</h1>
          <p>Choose number of players to start the game</p>
        </div>
        
        <div className="player-selection">
          <h2>Select Number of Players</h2>
          <div className="player-buttons">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                className={`player-count-btn ${numberOfPlayers === num ? 'selected' : ''}`}
                onClick={() => setNumberOfPlayers(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
          
          <div className="player-preview">
            <h3>Players in {numberOfPlayers}-player game:</h3>
            <div className="preview-players">
              {getPlayersForPreview(numberOfPlayers).map((player, index) => (
                <div key={index} className={`preview-player player-${player.color}`}>
                  {player.name}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="start-game-btn"
            onClick={() => startGame(numberOfPlayers)}
          >
            Start Game with {numberOfPlayers} Players
          </button>
        </div>
      </div>
    );
  }

  const getCurrentPlayerInfo = () => {
    const player = gameState.players[currentPlayer];
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
          gameState={gameState}
          currentPlayer={currentPlayer}
          diceValue={diceValue}
          onMovePiece={movePiece}
        />
        
        <div className="game-controls">
          <Dice 
            value={diceValue} 
            onRoll={rollDice}
            disabled={moveRequired}
          />
          <div className="player-turn">
            {getCurrentPlayerInfo().name}'s Turn
            {moveRequired && <div className="move-required">Must move a piece!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
