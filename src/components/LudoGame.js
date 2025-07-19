import React, { useState } from 'react';
import Board from './Board/Board';
import Dice from './Dice/Dice';
import './LudoGame.css';

const LudoGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
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

  const rollDice = () => {
    const newDiceValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newDiceValue);
    
    // Switch to next player if dice value is not 6
    if (newDiceValue !== 6) {
      setCurrentPlayer((prev) => (prev + 1) % 4);
    }
  };

  const movePiece = (playerIndex, pieceIndex, newPosition) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      newState.players[playerIndex].pieces[pieceIndex] = newPosition;
      return newState;
    });
  };

  return (
    <div className="ludo-game">
      <div className="game-header">
        <h1>Ludo Game</h1>
        <div className="current-player">
          Current Player: <span className={`player-${playerColors[currentPlayer]}`}>
            {playerNames[currentPlayer]}
          </span>
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
          <Dice value={diceValue} onRoll={rollDice} />
          <div className="player-turn">
            {playerNames[currentPlayer]}'s Turn
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
