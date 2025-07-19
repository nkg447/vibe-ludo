import React from 'react';
import './Board.css';

const Board = ({ gameState, currentPlayer, diceValue, onMovePiece }) => {
  // Board layout - 15x15 grid
  const BOARD_SIZE = 15;
  
  // Define the path positions for each color
  const getPathPositions = (color) => {
    const paths = {
      red: [
        // Starting from red home exit (6,1) and going clockwise
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
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        // Home stretch for red
        [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]
      ],
      blue: [
        // Starting from blue home exit (13,6) and going clockwise
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [0, 8],
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], [8, 14],
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
        // Home stretch for blue
        [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]
      ],
      yellow: [
        // Starting from yellow home exit (8,13) and going clockwise
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7], [14, 6],
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [0, 8],
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
        // Home stretch for yellow
        [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]
      ],
      green: [
        // Starting from green home exit (1,8) and going clockwise
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], [8, 14],
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7], [14, 6],
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [6, 0],
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [0, 8],
        // Home stretch for green
        [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
      ]
    };
    return paths[color] || [];
  };

  const canMovePiece = (playerIndex, pieceIndex) => {
    if (playerIndex !== currentPlayer) return false;
    
    const player = gameState.players[playerIndex];
    if (!player) return false;
    
    const currentPosition = player.pieces[pieceIndex];
    
    // Can move from home only with a 6
    if (currentPosition === 0) return diceValue === 6;
    
    // Can move pieces already on the board
    if (currentPosition > 0) return diceValue > 0;
    
    return false;
  };

  const handlePieceClick = (playerIndex, pieceIndex) => {
    console.log('Piece clicked:', { playerIndex, pieceIndex, currentPlayer, diceValue });
    
    if (!canMovePiece(playerIndex, pieceIndex)) {
      console.log('Cannot move this piece');
      return;
    }
    
    const player = gameState.players[playerIndex];
    const currentPosition = player.pieces[pieceIndex];
    console.log('Current position:', currentPosition);
    
    // If piece is at home (position 0) and dice is 6, move to start position
    if (currentPosition === 0 && diceValue === 6) {
      console.log('Moving piece from home to start');
      onMovePiece(playerIndex, pieceIndex, 1);
    } else if (currentPosition > 0 && diceValue > 0) {
      // Move piece forward by dice value
      const newPosition = Math.min(currentPosition + diceValue, 57);
      console.log('Moving piece from', currentPosition, 'to', newPosition);
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
    
    // Define specific piece positions within homes (2x2 grid in center of each home)
    const isRedPieceArea = row >= 2 && row <= 3 && col >= 2 && col <= 3;
    const isBluePieceArea = row >= 11 && row <= 12 && col >= 2 && col <= 3;
    const isYellowPieceArea = row >= 11 && row <= 12 && col >= 11 && col <= 12;
    const isGreenPieceArea = row >= 2 && row <= 3 && col >= 11 && col <= 12;
    
    // Define path cells
    const isPath = (
      (row === 6 && (col <= 5 || col >= 9)) ||
      (row === 8 && (col <= 5 || col >= 9)) ||
      (col === 6 && (row <= 5 || row >= 9)) ||
      (col === 8 && (row <= 5 || row >= 9)) ||
      (row === 7 && (col === 0 || col === 14)) ||
      (col === 7 && (row === 0 || row === 14))
    );
    
    // Define safe zones (colored squares) - at starting positions and 8th positions
    const isSafeZone = (
      (row === 6 && col === 1) || // Red starting position
      (row === 13 && col === 6) || // Blue starting position  
      (row === 8 && col === 13) || // Yellow starting position
      (row === 1 && col === 8) ||   // Green starting position
      // 8th positions after each starting point
      (row === 2 && col === 6) || // Red 8th position
      (row === 8 && col === 2) || // Blue 8th position
      (row === 12 && col === 8) || // Yellow 8th position
      (row === 6 && col === 12)   // Green 8th position
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
      if (isRedPieceArea) cellClass += ' piece-area';
    }
    else if (isBlueHome) {
      cellClass += ' blue-home';
      if (isBluePieceArea) cellClass += ' piece-area';
    }
    else if (isYellowHome) {
      cellClass += ' yellow-home';
      if (isYellowPieceArea) cellClass += ' piece-area';
    }
    else if (isGreenHome) {
      cellClass += ' green-home';
      if (isGreenPieceArea) cellClass += ' piece-area';
    }
    else if (isCenter) cellClass += ' center';
    else if (isPath) cellClass += ' path';
    else cellClass += ' border';
    
    if (isSafeZone) {
      cellClass += ' safe-zone';
      cellClass += ` ${getSafeZoneColor(row, col)}`;
    }
    
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
    
    // Add home pieces - map player indices to correct positions
    const getPlayerByColor = (color) => {
      return gameState.players.find(player => player.color === color);
    };
    
    const getPlayerIndexByColor = (color) => {
      return gameState.players.findIndex(player => player.color === color);
    };
    
    if (isRedPieceArea) {
      const redPlayer = getPlayerByColor('red');
      const redPlayerIndex = getPlayerIndexByColor('red');
      if (redPlayer) {
        const homeIndex = (row - 2) * 2 + (col - 2);
        if (homeIndex < 4) {
          const piece = redPlayer.pieces[homeIndex];
          if (piece === 0) {
            piecesOnCell.push({ playerIndex: redPlayerIndex, pieceIndex: homeIndex, color: 'red' });
          }
        }
      }
    }
    
    if (isBluePieceArea) {
      const bluePlayer = getPlayerByColor('blue');
      const bluePlayerIndex = getPlayerIndexByColor('blue');
      if (bluePlayer) {
        const homeIndex = (row - 11) * 2 + (col - 2);
        if (homeIndex < 4) {
          const piece = bluePlayer.pieces[homeIndex];
          if (piece === 0) {
            piecesOnCell.push({ playerIndex: bluePlayerIndex, pieceIndex: homeIndex, color: 'blue' });
          }
        }
      }
    }
    
    if (isYellowPieceArea) {
      const yellowPlayer = getPlayerByColor('yellow');
      const yellowPlayerIndex = getPlayerIndexByColor('yellow');
      if (yellowPlayer) {
        const homeIndex = (row - 11) * 2 + (col - 11);
        if (homeIndex < 4) {
          const piece = yellowPlayer.pieces[homeIndex];
          if (piece === 0) {
            piecesOnCell.push({ playerIndex: yellowPlayerIndex, pieceIndex: homeIndex, color: 'yellow' });
          }
        }
      }
    }
    
    if (isGreenPieceArea) {
      const greenPlayer = getPlayerByColor('green');
      const greenPlayerIndex = getPlayerIndexByColor('green');
      if (greenPlayer) {
        const homeIndex = (row - 2) * 2 + (col - 11);
        if (homeIndex < 4) {
          const piece = greenPlayer.pieces[homeIndex];
          if (piece === 0) {
            piecesOnCell.push({ playerIndex: greenPlayerIndex, pieceIndex: homeIndex, color: 'green' });
          }
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
            } ${
              canMovePiece(piece.playerIndex, piece.pieceIndex) ? 'movable-piece' : ''
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
