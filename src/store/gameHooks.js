import { useGame } from './GameContext';
import { canMovePiece, calculateNewPosition, getPiecePosition, findCapturablePieces, isSafeZone, isRedPieceArea, isYellowPieceArea, isGreenPieceArea, isBluePieceArea } from './gameUtils';
import { GAME_STATUS, GAME_CONSTANTS } from './gameTypes';
import { playMoveSound } from '../utils/soundEffects';

// Custom hooks for game functionality

// Hook for game state selectors
export const useGameSelectors = () => {
  const { gameState } = useGame();

  return {
    // Game status selectors
    isGameStarted: gameState.gameStarted,
    isGameFinished: gameState.gameStatus === GAME_STATUS.FINISHED,
    isGameInProgress: gameState.gameStatus === GAME_STATUS.IN_PROGRESS,
    gameStatus: gameState.gameStatus,
    
    // Player selectors
    currentPlayer: gameState.currentPlayer,
    numberOfPlayers: gameState.numberOfPlayers,
    selectedPlayerCount: gameState.selectedPlayerCount,
    players: gameState.players,
    winner: gameState.winner,
    
    // Current player info
    getCurrentPlayer: () => gameState.players[gameState.currentPlayer],
    getPlayer: (index) => gameState.players[index],
    
    // Turn selectors
    diceValue: gameState.diceValue,
    moveRequired: gameState.moveRequired,
    consecutiveSixes: gameState.consecutiveSixes,
    
    // Network selectors
    networkMode: gameState.networkMode,
    connectionStatus: gameState.connectionStatus,
    playerId: gameState.playerId,
    channelName: gameState.channelName,
    isMyTurn: gameState.isMyTurn,
    
    // History selectors
    moveHistory: gameState.moveHistory,
    turnHistory: gameState.turnHistory,
    lastMove: gameState.moveHistory[gameState.moveHistory.length - 1],
    
    // Utility selectors
    getPlayerByColor: (color) => gameState.players.find(p => p.color === color),
    getPlayerIndexByColor: (color) => gameState.players.findIndex(p => p.color === color),
    
    // Game statistics
    getGameDuration: () => {
      if (gameState.gameEndTime && gameState.turnHistory.length > 0) {
        const startTime = gameState.turnHistory[0].timestamp;
        return gameState.gameEndTime - startTime;
      }
      return 0;
    },
    
    getTotalMoves: () => gameState.moveHistory.length,
    getPlayerMoves: (playerIndex) => gameState.moveHistory.filter(move => move.player === playerIndex).length
  };
};

// Hook for game actions and logic
export const useGameActions = () => {
  const { gameState, actions } = useGame();

  // Define animatePieceMove function
  const animatePieceMove = (playerIndex, pieceIndex, fromPosition, toPosition, diceValue) => {
    actions.startPieceAnimation(playerIndex, pieceIndex, fromPosition, toPosition, diceValue);
    
    // Animate step by step
    let currentStep = 1;
    const animateStep = () => {
      if (currentStep <= diceValue) {
        // Play move sound for each step
        playMoveSound();
        
        actions.stepPieceAnimation(playerIndex, pieceIndex, currentStep, diceValue);
        currentStep++;
        setTimeout(animateStep, 300); // 300ms per step
      } else {
        // Animation complete, finalize the move
        actions.endPieceAnimation(playerIndex, pieceIndex, toPosition);
        // Now handle the actual game logic (captures, turn switching, etc.)
        actions.movePiece(playerIndex, pieceIndex, toPosition);
      }
    };
    
    setTimeout(animateStep, 300); // Start first step after 300ms
  };

  return {
    // Game lifecycle actions
    startGame: actions.startGame,
    restartGame: actions.restartGame,
    setPlayerCount: actions.setPlayerCount,
    
    // Turn actions
    rollDice: actions.rollDice,
    movePiece: actions.movePiece,
    switchPlayer: actions.switchPlayer,
    
    // Animation actions
    startPieceAnimation: actions.startPieceAnimation,
    stepPieceAnimation: actions.stepPieceAnimation,
    endPieceAnimation: actions.endPieceAnimation,
    
    // Network actions
    setNetworkMode: actions.setNetworkMode,
    hostGame: actions.hostGame,
    joinGame: actions.joinGame,
    disconnectFromNetwork: actions.disconnectFromNetwork,
    syncGameState: actions.syncGameState,
    
    // Validation functions
    canMovePiece: (playerIndex, pieceIndex) => 
      canMovePiece(gameState, gameState.currentPlayer, gameState.diceValue, playerIndex, pieceIndex),
    
    calculateNewPosition: (currentPosition, diceValue = gameState.diceValue) => 
      calculateNewPosition(currentPosition, diceValue),
    
    // Capture-related functions
    findCapturablePieces: (targetRow, targetCol, movingPlayerIndex) =>
      findCapturablePieces(gameState, targetRow, targetCol, movingPlayerIndex),
    
    isSafeZone: (row, col) => isSafeZone(row, col),
    
    // Helper functions
    getCurrentPlayerInfo: () => {
      const player = gameState.players[gameState.currentPlayer];
      if (!player) return { color: 'red', name: 'Red', id: 0 };
      return player;
    },
    
    getPlayersForPreview: (numPlayers = gameState.selectedPlayerCount) => {
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
    },
    
    // Advanced game logic
    handlePieceClick: (playerIndex, pieceIndex) => {
      if (!canMovePiece(gameState, gameState.currentPlayer, gameState.diceValue, playerIndex, pieceIndex)) {
        return false;
      }
      
      // Don't allow new moves while animating
      if (gameState.isAnimating) {
        return false;
      }
      
      const player = gameState.players[playerIndex];
      const currentPosition = player.pieces[pieceIndex];
      const newPosition = calculateNewPosition(currentPosition, gameState.diceValue);
      
      // Check for potential captures
      const targetBoardPosition = getPiecePosition(player.color, newPosition);
      if (targetBoardPosition) {
        const [targetRow, targetCol] = targetBoardPosition;
        const capturablePieces = findCapturablePieces(gameState, targetRow, targetCol, playerIndex);
        if (capturablePieces.length > 0) {
          console.log(`This move will capture ${capturablePieces.length} piece(s)!`);
        }
      }
      
      // Check if this is a move from home position to start position (should not animate)
      const isMovingFromHomeToStart = currentPosition === GAME_CONSTANTS.HOME_POSITION && 
                                      newPosition === 1 && 
                                      gameState.diceValue === GAME_CONSTANTS.WINNING_DICE_VALUE;
      
      if (isMovingFromHomeToStart) {
        // Move instantly without animation
        actions.movePiece(playerIndex, pieceIndex, newPosition);
      } else {
        // Start animated movement for all other moves
        animatePieceMove(playerIndex, pieceIndex, currentPosition, newPosition, gameState.diceValue);
      }
      return true;
    },

    // Animated piece movement function
    animatePieceMove: animatePieceMove
  };
};

// Hook for board-specific logic
export const useBoardLogic = () => {
  const { gameState } = useGame();
  const { canMovePiece } = useGameActions();

  return {
    // Board rendering helpers
    getPiecePosition: (color, position) => getPiecePosition(color, position),
    
    // Piece logic
    getPiecesOnCell: (row, col) => {
      const piecesOnCell = [];
      
      gameState.players.forEach((player, playerIndex) => {
        player.pieces.forEach((position, pieceIndex) => {
          let currentPosition = position;
          
          // Check if this piece is currently being animated
          if (gameState.animatingPiece && 
              gameState.animatingPiece.playerIndex === playerIndex && 
              gameState.animatingPiece.pieceIndex === pieceIndex) {
            currentPosition = gameState.animatingPiece.currentPosition;
          }
          
          const piecePos = getPiecePosition(player.color, currentPosition);
          if (piecePos && piecePos[0] === row && piecePos[1] === col) {
            const isVulnerable = !isSafeZone(row, col) && 
                               playerIndex !== gameState.currentPlayer && 
                               currentPosition !== GAME_CONSTANTS.HOME_POSITION;
            
            const isAnimating = gameState.animatingPiece && 
                              gameState.animatingPiece.playerIndex === playerIndex && 
                              gameState.animatingPiece.pieceIndex === pieceIndex;
            
            piecesOnCell.push({ 
              playerIndex, 
              pieceIndex, 
              color: player.color,
              isMovable: canMovePiece(playerIndex, pieceIndex) && !gameState.isAnimating,
              isCurrentPlayer: playerIndex === gameState.currentPlayer,
              isVulnerable: isVulnerable,
              isAnimating: isAnimating
            });
          }
        });
      });
      
      return piecesOnCell;
    },
    
    // Home area pieces
    getHomePieces: (color, row, col) => {
      const player = gameState.players.find(p => p.color === color);
      const playerIndex = gameState.players.findIndex(p => p.color === color);
      
      if (!player) return [];
      
      const pieces = [];
      
      // Map grid position to piece index based on color and position
      let homeIndex = -1;
      
      switch (color) {
        case 'red':
          if (isRedPieceArea(row, col)) {
            homeIndex = (row === 1 ? 0 : 1) + 2 * (col === 1 ? 0 : 1);
          }
          break;
        case 'blue':
          if (isBluePieceArea(row, col)) {
            homeIndex = (row === 10 ? 0 : 1) + 2 * (col === 1 ? 0 : 1);
          }
          break;
        case 'yellow':
          if (isYellowPieceArea(row, col)) {
            homeIndex = (row === 10 ? 0 : 1) + 2 * (col === 10 ? 0 : 1);
          }
          break;
        case 'green':
          if (isGreenPieceArea(row, col)) {
            homeIndex = (row === 1 ? 0 : 1) + 2 * (col === 10 ? 0 : 1);
          }
          break;
        default:
          // No valid color
          break;
      }
      
      if (homeIndex >= 0 && homeIndex < 4) {
        const piece = player.pieces[homeIndex];
        if (piece === GAME_CONSTANTS.HOME_POSITION) {
          pieces.push({
            playerIndex,
            pieceIndex: homeIndex,
            color: player.color,
            isMovable: canMovePiece(playerIndex, homeIndex),
            isCurrentPlayer: playerIndex === gameState.currentPlayer
          });
        }
      }
      
      return pieces;
    }
  };
};
