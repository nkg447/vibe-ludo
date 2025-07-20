import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
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
  const justRolledDice = useRef(false);

  // Handle incoming WebRTC actions
  const handleNetworkAction = useCallback((action) => {
    logger.log('Received network action:', action.type, 'Current network mode:', gameState.networkMode);
    // Only apply network actions if we're in network mode
    if (gameState.networkMode !== NETWORK_MODE.LOCAL) {
      logger.log('Applying network action:', action.type);
      dispatch(action);
    } else {
      logger.log('Ignoring network action in LOCAL mode:', action.type);
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

  // Effect to broadcast dice roll results after local dice roll
  useEffect(() => {
    if (justRolledDice.current && gameState.networkMode !== NETWORK_MODE.LOCAL) {
      justRolledDice.current = false;
      
      logger.log('Broadcasting dice roll results - diceValue:', gameState.diceValue, 'moveRequired:', gameState.moveRequired, 'currentPlayer:', gameState.currentPlayer);
      
      if (gameState.diceValue > 0 && gameState.moveRequired) {
        // Case 1: Player has valid moves, broadcast dice value and move requirement
        logger.log('Broadcasting dice value and move requirement for valid moves case');
        broadcastAction(gameActions.setDiceValue(gameState.diceValue));
        broadcastAction(gameActions.setMoveRequired(true));
      } else if (gameState.diceValue <= 0) {
        // Case 2: No valid moves, dice value is negative, broadcast the dice value and player switch
        logger.log('No valid moves - broadcasting negative dice value and player switch to:', gameState.currentPlayer);
        broadcastAction(gameActions.setDiceValue(gameState.diceValue));
        broadcastAction(gameActions.switchPlayer(gameState.currentPlayer));
      }
    }
  }, [gameState.diceValue, gameState.moveRequired, gameState.currentPlayer, gameState.networkMode, broadcastAction]);

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
        
        await webrtcService.connect(channelName, false);
        
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
        
        await webrtcService.connect(channelName, true);
        
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
      
      logger.log('Rolling dice for player', gameState.currentPlayer, 'Network mode:', gameState.networkMode);
      
      // Set flag to indicate we just rolled dice locally
      justRolledDice.current = true;
      
      // Dispatch the ROLL_DICE action locally only (not broadcasted)
      // The dice value will be generated and the effect above will broadcast the result
      const action = gameActions.rollDice();
      logger.log('Dispatching dice roll action locally only');
      dispatch(action);
      
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
      // Note: We don't broadcast this automatically anymore since it's handled 
      // specifically in the dice roll result broadcasting
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
