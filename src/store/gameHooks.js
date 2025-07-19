import { useGame } from './GameContext';
import { canMovePiece, hasValidMoves, calculateNewPosition, getPiecePosition } from './gameUtils';
import { GAME_STATUS, GAME_CONSTANTS } from './gameTypes';

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

  return {
    // Game lifecycle actions
    startGame: actions.startGame,
    restartGame: actions.restartGame,
    setPlayerCount: actions.setPlayerCount,
    
    // Turn actions
    rollDice: actions.rollDice,
    movePiece: actions.movePiece,
    switchPlayer: actions.switchPlayer,
    
    // Network actions
    setNetworkMode: actions.setNetworkMode,
    hostGame: actions.hostGame,
    joinGame: actions.joinGame,
    disconnectFromNetwork: actions.disconnectFromNetwork,
    syncGameState: actions.syncGameState,
    
    // Validation functions
    canMovePiece: (playerIndex, pieceIndex) => 
      canMovePiece(gameState, gameState.currentPlayer, gameState.diceValue, playerIndex, pieceIndex),
    
    hasValidMoves: (playerIndex, diceValue = gameState.diceValue) => 
      hasValidMoves(gameState, playerIndex, diceValue),
    
    calculateNewPosition: (currentPosition, diceValue = gameState.diceValue) => 
      calculateNewPosition(currentPosition, diceValue),
    
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
      
      const player = gameState.players[playerIndex];
      const currentPosition = player.pieces[pieceIndex];
      const newPosition = calculateNewPosition(currentPosition, gameState.diceValue);
      
      actions.movePiece(playerIndex, pieceIndex, newPosition);
      return true;
    }
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
          const piecePos = getPiecePosition(player.color, position);
          if (piecePos && piecePos[0] === row && piecePos[1] === col) {
            piecesOnCell.push({ 
              playerIndex, 
              pieceIndex, 
              color: player.color,
              isMovable: canMovePiece(playerIndex, pieceIndex),
              isCurrentPlayer: playerIndex === gameState.currentPlayer
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
          if (row >= 2 && row <= 3 && col >= 2 && col <= 3) {
            homeIndex = (row - 2) * 2 + (col - 2);
          }
          break;
        case 'blue':
          if (row >= 11 && row <= 12 && col >= 2 && col <= 3) {
            homeIndex = (row - 11) * 2 + (col - 2);
          }
          break;
        case 'yellow':
          if (row >= 11 && row <= 12 && col >= 11 && col <= 12) {
            homeIndex = (row - 11) * 2 + (col - 11);
          }
          break;
        case 'green':
          if (row >= 2 && row <= 3 && col >= 11 && col <= 12) {
            homeIndex = (row - 2) * 2 + (col - 11);
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
