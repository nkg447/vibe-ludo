import React from 'react';
import { useGameActions, useBoardLogic } from '../../store';
import './Board.css';
import { isRedPieceArea, isBluePieceArea, isGreenPieceArea, isYellowPieceArea, isSafeZone } from '../../store/gameUtils';

let isAutoMoving = false;

const Board = ({ gameState, currentPlayer, diceValue }) => {
  // Board layout - 15x15 grid
  const BOARD_SIZE = 15;
  
  // Use game actions and board logic hooks
  const { handlePieceClick } = useGameActions();
  const { getPiecesOnCell, getHomePieces, getMovablePieces } = useBoardLogic();

  const movablePieces = getMovablePieces();
  if (movablePieces.length === 1 && !isAutoMoving) {
    isAutoMoving = true;
    // Auto-move the piece
    setTimeout(() => {
      handlePieceClick(movablePieces[0].playerIndex, movablePieces[0].pieceIndex);
      isAutoMoving = false;
    }, 0); // Delay to allow UI to update
  }

  const renderCell = (row, col) => {
    const cellKey = `${row}-${col}`;
    let cellClass = 'board-cell';
    
    // Define home areas
    const isRedHome = row >= 0 && row <= 5 && col >= 0 && col <= 5;
    const isBlueHome = row >= 9 && row <= 14 && col >= 0 && col <= 5;
    const isYellowHome = row >= 9 && row <= 14 && col >= 9 && col <= 14;
    const isGreenHome = row >= 0 && row <= 5 && col >= 9 && col <= 14;
    
    // Define path cells
    const isPath = (
      (row === 6 && (col <= 5 || col >= 9)) ||
      (row === 8 && (col <= 5 || col >= 9)) ||
      (col === 6 && (row <= 5 || row >= 9)) ||
      (col === 8 && (row <= 5 || row >= 9)) ||
      (row === 7 && (col === 0 || col === 14)) ||
      (col === 7 && (row === 0 || row === 14))
    );
    
    // Get safe zone color based on position
    const getSafeZoneColor = (row, col) => {
      if (row === 6 && col === 1) return 'red-safe';
      if (row === 13 && col === 6) return 'blue-safe';
      if (row === 8 && col === 13) return 'yellow-safe';
      if (row === 1 && col === 8) return 'green-safe';
      // 8th position safe zones
      if (row === 2 && col === 6) return 'red-safe';
      if (row === 8 && col === 2) return 'blue-safe';
      if (row === 12 && col === 8) return 'yellow-safe';
      if (row === 6 && col === 12) return 'green-safe';
      return '';
    };
    
    // Center area
    const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
    
    if (isRedHome) {
      cellClass += ' red-home';
      if (isRedPieceArea(row, col)) cellClass += ' piece-area';
    }
    else if (isBlueHome) {
      cellClass += ' blue-home';
      if (isBluePieceArea(row, col)) cellClass += ' piece-area';
    }
    else if (isYellowHome) {
      cellClass += ' yellow-home';
      if (isYellowPieceArea(row, col)) cellClass += ' piece-area';
    }
    else if (isGreenHome) {
      cellClass += ' green-home';
      if (isGreenPieceArea(row, col)) cellClass += ' piece-area';
    }
    else if (isCenter) cellClass += ' center';
    else if (isPath) cellClass += ' path';
    else cellClass += ' border';

    if (isSafeZone(row, col)) {
      cellClass += ' safe-zone';
      cellClass += ` ${getSafeZoneColor(row, col)}`;
    }
    
    // Find pieces on this cell
    const piecesOnCell = getPiecesOnCell(row, col);
    
    // Add home pieces - use the new logic
    const homePieces = [];
    if (isRedPieceArea(row, col)) {
      homePieces.push(...getHomePieces('red', row, col));
    }
    if (isBluePieceArea(row, col)) {
      homePieces.push(...getHomePieces('blue', row, col));
    }
    if (isYellowPieceArea(row, col)) {
      homePieces.push(...getHomePieces('yellow', row, col));
    }
    if (isGreenPieceArea(row, col)) {
      homePieces.push(...getHomePieces('green', row, col));
    }
    
    const allPieces = [...piecesOnCell, ...homePieces];
    
    return (
      <div key={cellKey} className={cellClass}>
        {allPieces.map((piece, index) => (
          <div
            key={`${piece.playerIndex}-${piece.pieceIndex}`}
            className={`game-piece ${piece.color}-piece ${
              piece.isCurrentPlayer ? 'current-player-piece' : ''
            } ${
              piece.isMovable ? 'movable-piece' : ''
            } ${
              piece.isVulnerable ? 'vulnerable-piece' : ''
            } ${
              piece.isAnimating ? 'moving-step' : ''
            }`}
            onClick={() => handlePieceClick(piece.playerIndex, piece.pieceIndex)}
            style={{
              transform: allPieces.length > 1 ? `translate(${index * 3}px, ${index * 3}px)` : 'none'
            }}
            title={piece.isVulnerable ? 'This piece can be captured!' : ''}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="ludo-board">
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => renderCell(row, col))
      )}
    </div>
  );
};

export default Board;
