import { GAME_CONSTANTS } from './gameTypes';

// Board path positions for each player color
export const getPathPositions = (color) => {
  const paths = {
    red: [
      // Starting from red home exit (6,1) and going clockwise
      [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
      [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
      [0, 7], [0, 8],
      [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
      [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], 
      [7, 14], [8, 14],
      [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
      [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
      [14, 7], [14, 6],
      [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
      [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
      [7, 0],
      // Home stretch for red
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
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
      [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
      [14, 7],
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
      [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
      [7, 14],
      // Home stretch for yellow
      [7, 13], [7, 12], [7, 11], [7, 10], [7, 9]
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
      [0, 7],
      // Home stretch for green
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
    ]
  };
  return paths[color] || [];
};

// Calculate piece position on board
export const getPiecePosition = (color, position) => {
  if (position === 0) return null; // Piece is at home
  const pathPositions = getPathPositions(color);
  return pathPositions[position - 1] || null;
};

// Check if a piece can be moved
export const canMovePiece = (gameState, currentPlayer, diceValue, playerIndex, pieceIndex) => {
  if (playerIndex !== currentPlayer) return false;
  if (diceValue <= 0) return false; // Also check for negative values (dice not used)
  
  const player = gameState.players[playerIndex];
  if (!player) return false;
  
  const currentPosition = player.pieces[pieceIndex];
  
  // Can move from home only with a 6
  if (currentPosition === GAME_CONSTANTS.HOME_POSITION) {
    return diceValue === GAME_CONSTANTS.WINNING_DICE_VALUE;
  }
  
  // Can move pieces already on the board
  if (currentPosition > 0) {
    const newPosition = currentPosition + diceValue;
    return newPosition <= GAME_CONSTANTS.MAX_POSITION;
  }
  
  return false;
};

// Calculate new position for a piece
export const calculateNewPosition = (currentPosition, diceValue) => {
  if (currentPosition === GAME_CONSTANTS.HOME_POSITION && diceValue === GAME_CONSTANTS.WINNING_DICE_VALUE) {
    return 1; // Move to start position
  }
  
  if (currentPosition > 0) {
    return Math.min(currentPosition + diceValue, GAME_CONSTANTS.MAX_POSITION);
  }
  
  return currentPosition;
};

// Get list of pieces that can be moved for a given dice value
export const getMovablePieces = (gameState, playerIndex, diceValue) => {
  const player = gameState.players[playerIndex];
  if (!player) return [];
  
  const movablePieces = [];
  player.pieces.forEach((position, pieceIndex) => {
    if (canMovePiece(gameState, playerIndex, diceValue, playerIndex, pieceIndex)) {
      movablePieces.push({
        pieceIndex,
        playerIndex
      });
    }
  });
  
  return movablePieces;
};

// Check if a player has won (all pieces at home)
export const hasPlayerWon = (player) => {
  return player.pieces.every(position => position === GAME_CONSTANTS.MAX_POSITION);
};

// Check if a position is a safe zone
export const isSafeZone = (row, col) => {
  return (
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
};

// Get pieces that can capture at a specific position
export const getPiecesAtPosition = (gameState, targetPosition, excludePlayer = -1) => {
  const piecesAtPosition = [];
  
  gameState.players.forEach((player, playerIndex) => {
    if (playerIndex === excludePlayer) return;
    
    player.pieces.forEach((position, pieceIndex) => {
      const piecePos = getPiecePosition(player.color, position);
      if (piecePos && targetPosition) {
        const [targetRow, targetCol] = targetPosition;
        const [pieceRow, pieceCol] = piecePos;
        if (targetRow === pieceRow && targetCol === pieceCol) {
          piecesAtPosition.push({ playerIndex, pieceIndex, color: player.color });
        }
      }
    });
  });
  
  return piecesAtPosition;
};

// Check for pieces that can be captured at a target position
export const findCapturablePieces = (gameState, targetRow, targetCol, movingPlayerIndex) => {
  // Don't capture on safe zones
  if (isSafeZone(targetRow, targetCol)) {
    return [];
  }
  
  const capturablePieces = [];
  
  gameState.players.forEach((player, playerIndex) => {
    // Don't capture own pieces
    if (playerIndex === movingPlayerIndex) return;
    
    player.pieces.forEach((position, pieceIndex) => {
      // Only pieces on the board can be captured (not in home)
      if (position === GAME_CONSTANTS.HOME_POSITION) return;
      
      const piecePos = getPiecePosition(player.color, position);
      if (piecePos) {
        const [pieceRow, pieceCol] = piecePos;
        if (pieceRow === targetRow && pieceCol === targetCol) {
          capturablePieces.push({ 
            playerIndex, 
            pieceIndex, 
            color: player.color,
            position: position
          });
        }
      }
    });
  });
  
  return capturablePieces;
};

// Generate random dice value
export const rollDiceValue = () => {
  return Math.floor(Math.random() * 6) + 1;
};

export const isRedPieceArea = (row, col) => (row === 1 || row === 4) && (col === 1 || col === 4);
export const isBluePieceArea = (row, col) => (row === 10 || row === 13) && (col === 1 || col === 4);
export const isYellowPieceArea = (row, col) => (row === 10 || row === 13) && (col === 10 || col === 13);
export const isGreenPieceArea = (row, col) => (row === 1 || row === 4) && (col === 10 || col === 13);