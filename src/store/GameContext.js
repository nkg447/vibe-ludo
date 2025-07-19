import React, { createContext, useContext, useReducer } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { gameActions } from './gameActions';
import logger from '../logger';

// Create the game context
const GameContext = createContext();

// Game Context Provider component
export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Enhanced action dispatchers with logging and validation
  const actions = {
    // Game lifecycle
    startGame: (numberOfPlayers) => {
      logger.log('Starting game with', numberOfPlayers, 'players');
      dispatch(gameActions.startGame(numberOfPlayers));
    },

    restartGame: () => {
      logger.log('Restarting game');
      dispatch(gameActions.restartGame());
    },

    setPlayerCount: (count) => {
      logger.log('Setting player count to', count);
      dispatch(gameActions.setPlayerCount(count));
    },

    // Turn management
    rollDice: () => {
      if (gameState.moveRequired) {
        logger.log('Cannot roll dice - move required');
        return false;
      }
      logger.log('Rolling dice for player', gameState.currentPlayer);
      dispatch(gameActions.rollDice());
      return true;
    },

    movePiece: (playerIndex, pieceIndex, newPosition) => {
      logger.log('Moving piece:', { playerIndex, pieceIndex, newPosition });
      dispatch(gameActions.movePiece(playerIndex, pieceIndex, newPosition));
    },

    switchPlayer: (playerIndex) => {
      logger.log('Switching to player', playerIndex);
      dispatch(gameActions.switchPlayer(playerIndex));
    },

    setMoveRequired: (required) => {
      dispatch(gameActions.setMoveRequired(required));
    },

    // Direct state updates (for advanced usage)
    setDiceValue: (value) => {
      dispatch(gameActions.setDiceValue(value));
    },

    updatePiecePosition: (playerIndex, pieceIndex, position) => {
      dispatch(gameActions.updatePiecePosition(playerIndex, pieceIndex, position));
    },

    capturePiece: (capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex) => {
      logger.log('Capturing piece:', { capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex });
      dispatch(gameActions.capturePiece(capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex));
    },

    winGame: (winnerIndex) => {
      logger.log('Game won by player', winnerIndex);
      dispatch(gameActions.winGame(winnerIndex));
    }
  };

  // Provide both state and actions
  const contextValue = {
    gameState,
    dispatch,
    actions
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};
