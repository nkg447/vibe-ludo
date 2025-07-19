import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { gameActions } from './gameActions';
import { NETWORK_MODE, CONNECTION_STATUS } from './gameTypes';
import webrtcService from '../services/webrtcService';
import logger from '../logger';

// Create the game context
const GameContext = createContext();

// Game Context Provider component
export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Handle incoming WebRTC actions
  const handleNetworkAction = useCallback((action) => {
    logger.log('Received network action:', action.type);
    // Only apply network actions if we're in network mode
    if (gameState.networkMode !== NETWORK_MODE.LOCAL) {
      dispatch(action);
    }
  }, [gameState.networkMode]);

  // Setup WebRTC service listeners
  useEffect(() => {
    const unsubscribeAction = webrtcService.onActionReceived(handleNetworkAction);
    
    const unsubscribeConnection = webrtcService.onConnectionChange((isConnected) => {
      dispatch(gameActions.setConnectionStatus(
        isConnected ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.DISCONNECTED
      ));
    });

    return () => {
      unsubscribeAction();
      unsubscribeConnection();
    };
  }, [handleNetworkAction]);

  // Helper function to broadcast actions to peers
  const broadcastAction = useCallback((action) => {
    if (gameState.networkMode !== NETWORK_MODE.LOCAL) {
      webrtcService.broadcastAction(action);
    }
  }, [gameState.networkMode]);

  // Enhanced action dispatchers with logging, validation, and network broadcasting
  const actions = {
    // Network actions
    setNetworkMode: (mode) => {
      logger.log('Setting network mode to', mode);
      dispatch(gameActions.setNetworkMode(mode));
    },

    hostGame: async (channelName) => {
      try {
        logger.log('Hosting game with channel:', channelName);
        dispatch(gameActions.setNetworkMode(NETWORK_MODE.HOST));
        dispatch(gameActions.setConnectionStatus(CONNECTION_STATUS.CONNECTING));
        dispatch(gameActions.setPlayerId(0)); // Host is always player 0
        
        await webrtcService.connect(channelName, true);
        
        return channelName;
      } catch (error) {
        logger.error('Failed to host game:', error);
        dispatch(gameActions.setConnectionStatus(CONNECTION_STATUS.ERROR));
        throw error;
      }
    },

    joinGame: async (channelName) => {
      try {
        logger.log('Joining game with channel:', channelName);
        dispatch(gameActions.setNetworkMode(NETWORK_MODE.GUEST));
        dispatch(gameActions.setConnectionStatus(CONNECTION_STATUS.CONNECTING));
        dispatch(gameActions.setPlayerId(1)); // Guest is player 1 (for 2-player games)
        
        await webrtcService.connect(channelName, false);
        
        return channelName;
      } catch (error) {
        logger.error('Failed to join game:', error);
        dispatch(gameActions.setConnectionStatus(CONNECTION_STATUS.ERROR));
        throw error;
      }
    },

    disconnectFromNetwork: () => {
      logger.log('Disconnecting from network');
      webrtcService.disconnect();
      dispatch(gameActions.setNetworkMode(NETWORK_MODE.LOCAL));
      dispatch(gameActions.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED));
      dispatch(gameActions.setPlayerId(null));
    },

    syncGameState: (remoteGameState) => {
      logger.log('Syncing game state from remote');
      dispatch(gameActions.syncGameState(remoteGameState));
    },

    // Game lifecycle
    startGame: (numberOfPlayers) => {
      logger.log('Starting game with', numberOfPlayers, 'players');
      const action = gameActions.startGame(numberOfPlayers);
      dispatch(action);
      broadcastAction(action);
    },

    restartGame: () => {
      logger.log('Restarting game');
      const action = gameActions.restartGame();
      dispatch(action);
      broadcastAction(action);
    },

    setPlayerCount: (count) => {
      logger.log('Setting player count to', count);
      const action = gameActions.setPlayerCount(count);
      dispatch(action);
      broadcastAction(action);
    },

    // Turn management
    rollDice: () => {
      // Check if it's the player's turn in network mode
      if (gameState.networkMode !== NETWORK_MODE.LOCAL && !gameState.isMyTurn) {
        logger.log('Cannot roll dice - not your turn');
        return false;
      }

      if (gameState.moveRequired) {
        logger.log('Cannot roll dice - move required');
        return false;
      }
      
      logger.log('Rolling dice for player', gameState.currentPlayer);
      const action = gameActions.rollDice();
      dispatch(action);
      broadcastAction(action);
      return true;
    },

    movePiece: (playerIndex, pieceIndex, newPosition) => {
      // Check if it's the player's turn in network mode
      if (gameState.networkMode !== NETWORK_MODE.LOCAL && !gameState.isMyTurn) {
        logger.log('Cannot move piece - not your turn');
        return false;
      }

      logger.log('Moving piece:', { playerIndex, pieceIndex, newPosition });
      const action = gameActions.movePiece(playerIndex, pieceIndex, newPosition);
      dispatch(action);
      broadcastAction(action);
      return true;
    },

    switchPlayer: (playerIndex) => {
      logger.log('Switching to player', playerIndex);
      const action = gameActions.switchPlayer(playerIndex);
      dispatch(action);
      broadcastAction(action);
    },

    setMoveRequired: (required) => {
      const action = gameActions.setMoveRequired(required);
      dispatch(action);
      broadcastAction(action);
    },

    // Direct state updates (for advanced usage)
    setDiceValue: (value) => {
      const action = gameActions.setDiceValue(value);
      dispatch(action);
      broadcastAction(action);
    },

    updatePiecePosition: (playerIndex, pieceIndex, position) => {
      const action = gameActions.updatePiecePosition(playerIndex, pieceIndex, position);
      dispatch(action);
      broadcastAction(action);
    },

    capturePiece: (capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex) => {
      logger.log('Capturing piece:', { capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex });
      const action = gameActions.capturePiece(capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex);
      dispatch(action);
      broadcastAction(action);
    },

    winGame: (winnerIndex) => {
      logger.log('Game won by player', winnerIndex);
      const action = gameActions.winGame(winnerIndex);
      dispatch(action);
      broadcastAction(action);
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
