import React from 'react';
import { useGameSelectors } from '../../store';
import './GameStats.css';

const GameStats = () => {
  const {
    moveHistory,
    turnHistory,
    getGameDuration,
    getTotalMoves,
    getPlayerMoves,
    players,
    gameStatus,
    consecutiveSixes
  } = useGameSelectors();

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-stats">
      <h3>Game Statistics</h3>
      
      <div className="stat-row">
        <span className="stat-label">Game Duration:</span>
        <span className="stat-value">{formatDuration(getGameDuration())}</span>
      </div>
      
      <div className="stat-row">
        <span className="stat-label">Total Moves:</span>
        <span className="stat-value">{getTotalMoves()}</span>
      </div>
      
      <div className="stat-row">
        <span className="stat-label">Consecutive Sixes:</span>
        <span className="stat-value">{consecutiveSixes}</span>
      </div>
      
      <div className="player-stats">
        <h4>Player Statistics</h4>
        {players.map((player, index) => (
          <div key={player.id} className="player-stat">
            <span className={`player-name player-${player.color}`}>
              {player.name}:
            </span>
            <span className="player-moves">
              {getPlayerMoves(index)} moves
            </span>
            <span className="pieces-home">
              {player.pieces.filter(p => p === 0).length} pieces at home
            </span>
            <span className="pieces-finished">
              {player.pieces.filter(p => p === 57).length} pieces finished
            </span>
          </div>
        ))}
      </div>
      
      {moveHistory.length > 0 && (
        <div className="recent-moves">
          <h4>Recent Moves</h4>
          <div className="moves-list">
            {moveHistory.slice(-5).reverse().map((move, index) => (
              <div key={index} className="move-entry">
                <span className={`player-${players[move.player]?.color}`}>
                  {players[move.player]?.name}
                </span>
                {' '}moved piece {move.pieceIndex + 1} from {move.from} to {move.to}
                {' '}(dice: {move.diceValue})
                {move.capturedPieces > 0 && (
                  <span className="capture-indicator"> ⚔️ {move.capturedPieces} captured!</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
