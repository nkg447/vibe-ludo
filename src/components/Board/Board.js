import React from 'react';
import './Board.css';

const Board = ({ gameState, currentPlayer, diceValue, onMovePiece }) => {
  // Board layout - 15x15 grid
  const BOARD_SIZE = 15;
  
  // Define the path positions for each color
  const getPathPositions = (color) => {
    const paths = {
      red: [
        // Starting from red home exit
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [0, 8],
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
        [7, 13], [8, 13],
        [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7], [14, 6],
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
        [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]
      ],
      blue: [
        // Starting from blue home exit
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
        [0, 7], [0, 8],
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], [8, 14],
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [7, 8], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3]
      ],
      yellow: [
        // Starting from yellow home exit
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7], [14, 6],
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
        [7, 1], [6, 1],
        [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [0, 8],
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [7, 8], [7, 9], [7, 10], [7, 11], [7, 12], [7, 13]
      ],
      green: [
        // Starting from green home exit
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], [8, 14],
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
        [14, 7], [14, 6],
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [7, 11]
      ]
    };
    return paths[color] || [];
  };

  const handlePieceClick = (playerIndex, pieceIndex) => {
    if (playerIndex !== currentPlayer) return;
    
    const player = gameState.players[playerIndex];
    const currentPosition = player.pieces[pieceIndex];
    
    // If piece is at home (position 0) and dice is 6, move to start position
    if (currentPosition === 0 && diceValue === 6) {
      onMovePiece(playerIndex, pieceIndex, 1);
    } else if (currentPosition > 0) {
      // Move piece forward by dice value
      const newPosition = Math.min(currentPosition + diceValue, 57);
      onMovePiece(playerIndex, pieceIndex, newPosition);
    }
  };

  const getPiecePosition = (color, position) => {
    if (position === 0) return null; // Piece is at home
    const pathPositions = getPathPositions(color);
    return pathPositions[position - 1] || null;
  };

  const renderCell = (row, col) => {
    const cellKey = `${row}-${col}`;
    let cellClass = 'board-cell';
    
    // Define home areas
    const isRedHome = row >= 1 && row <= 5 && col >= 1 && col <= 5;
    const isBlueHome = row >= 9 && row <= 13 && col >= 1 && col <= 5;
    const isYellowHome = row >= 9 && row <= 13 && col >= 9 && col <= 13;
    const isGreenHome = row >= 1 && row <= 5 && col >= 9 && col <= 13;
    
    // Define path cells
    const isPath = (
      (row === 6 && (col <= 5 || col >= 9)) ||
      (row === 8 && (col <= 5 || col >= 9)) ||
      (col === 6 && (row <= 5 || row >= 9)) ||
      (col === 8 && (row <= 5 || row >= 9)) ||
      (row === 7 && (col === 0 || col === 14)) ||
      (col === 7 && (row === 0 || row === 14))
    );
    
    // Define safe zones (colored squares)
    const isSafeZone = (
      (row === 6 && col === 2) || // Red safe
      (row === 2 && col === 8) || // Blue safe
      (row === 8 && col === 12) || // Yellow safe
      (row === 12 && col === 6)   // Green safe
    );
    
    // Center area
    const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
    
    if (isRedHome) cellClass += ' red-home';
    else if (isBlueHome) cellClass += ' blue-home';
    else if (isYellowHome) cellClass += ' yellow-home';
    else if (isGreenHome) cellClass += ' green-home';
    else if (isCenter) cellClass += ' center';
    else if (isPath) cellClass += ' path';
    else cellClass += ' border';
    
    if (isSafeZone) cellClass += ' safe-zone';
    
    // Find pieces on this cell
    const piecesOnCell = [];
    gameState.players.forEach((player, playerIndex) => {
      player.pieces.forEach((position, pieceIndex) => {
        const piecePos = getPiecePosition(player.color, position);
        if (piecePos && piecePos[0] === row && piecePos[1] === col) {
          piecesOnCell.push({ playerIndex, pieceIndex, color: player.color });
        }
      });
    });
    
    // Add home pieces
    if (isRedHome && row >= 2 && row <= 4 && col >= 2 && col <= 4) {
      const homeIndex = (row - 2) * 3 + (col - 2);
      if (homeIndex < 4) {
        const piece = gameState.players[0].pieces[homeIndex];
        if (piece === 0) {
          piecesOnCell.push({ playerIndex: 0, pieceIndex: homeIndex, color: 'red' });
        }
      }
    }
    
    if (isBlueHome && row >= 10 && row <= 12 && col >= 2 && col <= 4) {
      const homeIndex = (row - 10) * 3 + (col - 2);
      if (homeIndex < 4) {
        const piece = gameState.players[1].pieces[homeIndex];
        if (piece === 0) {
          piecesOnCell.push({ playerIndex: 1, pieceIndex: homeIndex, color: 'blue' });
        }
      }
    }
    
    if (isYellowHome && row >= 10 && row <= 12 && col >= 10 && col <= 12) {
      const homeIndex = (row - 10) * 3 + (col - 10);
      if (homeIndex < 4) {
        const piece = gameState.players[2].pieces[homeIndex];
        if (piece === 0) {
          piecesOnCell.push({ playerIndex: 2, pieceIndex: homeIndex, color: 'yellow' });
        }
      }
    }
    
    if (isGreenHome && row >= 2 && row <= 4 && col >= 10 && col <= 12) {
      const homeIndex = (row - 2) * 3 + (col - 10);
      if (homeIndex < 4) {
        const piece = gameState.players[3].pieces[homeIndex];
        if (piece === 0) {
          piecesOnCell.push({ playerIndex: 3, pieceIndex: homeIndex, color: 'green' });
        }
      }
    }
    
    return (
      <div key={cellKey} className={cellClass}>
        {piecesOnCell.map((piece, index) => (
          <div
            key={`${piece.playerIndex}-${piece.pieceIndex}`}
            className={`game-piece ${piece.color}-piece ${
              piece.playerIndex === currentPlayer ? 'current-player-piece' : ''
            }`}
            onClick={() => handlePieceClick(piece.playerIndex, piece.pieceIndex)}
            style={{
              transform: piecesOnCell.length > 1 ? `translate(${index * 3}px, ${index * 3}px)` : 'none'
            }}
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
