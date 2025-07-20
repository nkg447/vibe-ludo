import { GAME_ACTIONS, GAME_STATUS, PLAYER_CONFIGS, GAME_CONSTANTS, NETWORK_MODE, CONNECTION_STATUS } from './gameTypes';
import { hasValidMoves, hasPlayerWon, rollDiceValue, findCapturablePieces, getPiecePosition } from './gameUtils';
import logger from '../logger';

// Initial game state
export const initialGameState = {
  // Game setup
  gameStarted: false,
  gameStatus: GAME_STATUS.SETUP,
  numberOfPlayers: 4,
  selectedPlayerCount: 4,
  
  // Game state
  players: [
    { id: 0, color: 'red', name: 'Red', pieces: [0, 0, 0, 0], score: 0 },
    { id: 1, color: 'blue', name: 'Blue', pieces: [0, 0, 0, 0], score: 0 },
    { id: 2, color: 'yellow', name: 'Yellow', pieces: [0, 0, 0, 0], score: 0 },
    { id: 3, color: 'green', name: 'Green', pieces: [0, 0, 0, 0], score: 0 }
  ],
  
  // Turn management
  currentPlayer: 0,
  diceValue: 0,
  moveRequired: false,
  consecutiveSixes: 0,
  
  // Game history
  moveHistory: [],
  turnHistory: [],
  
  // Winner
  winner: null,
  gameEndTime: null,

  // WebRTC network state
  networkMode: NETWORK_MODE.LOCAL,
  connectionStatus: CONNECTION_STATUS.DISCONNECTED,
  playerId: null,
  channelName: null,
  isMyTurn: true // For local games, always true initially
};

// Game reducer
export const gameReducer = (state, action) => {
  logger.log('Game action:', action.type, action.payload);
  
  switch (action.type) {
    case GAME_ACTIONS.SET_PLAYER_COUNT:
      return {
        ...state,
        selectedPlayerCount: action.payload.count
      };

    case GAME_ACTIONS.START_GAME: {
      const { numberOfPlayers } = action.payload;
      const playerConfigs = PLAYER_CONFIGS[numberOfPlayers] || PLAYER_CONFIGS[4];
      
      const players = playerConfigs.map(config => ({
        ...config,
        pieces: [0, 0, 0, 0],
        score: 0
      }));
      
      return {
        ...state,
        gameStarted: true,
        gameStatus: GAME_STATUS.IN_PROGRESS,
        numberOfPlayers,
        players,
        currentPlayer: 0,
        diceValue: 0,
        moveRequired: false,
        consecutiveSixes: 0,
        moveHistory: [],
        turnHistory: [],
        winner: null,
        gameEndTime: null
      };
    }

    case GAME_ACTIONS.RESTART_GAME:
      return {
        ...initialGameState,
        selectedPlayerCount: state.selectedPlayerCount
      };

    case GAME_ACTIONS.ROLL_DICE: {
      if (state.moveRequired) {
        logger.log('Cannot roll dice - must move a piece first');
        return state;
      }

      const newDiceValue = rollDiceValue();
      logger.log('Dice rolled:', newDiceValue, 'Current player:', state.currentPlayer, 'Number of players:', state.numberOfPlayers);
      
      const playerHasValidMoves = hasValidMoves(state, state.currentPlayer, newDiceValue);
      logger.log('Player has valid moves:', playerHasValidMoves);
      
      let newConsecutiveSixes = state.consecutiveSixes;
      if (newDiceValue === GAME_CONSTANTS.WINNING_DICE_VALUE) {
        newConsecutiveSixes += 1;
      } else {
        newConsecutiveSixes = 0;
      }
      
      if (playerHasValidMoves) {
        logger.log('Player has moves, setting moveRequired to true');
        return {
          ...state,
          diceValue: newDiceValue,
          moveRequired: true,
          consecutiveSixes: newConsecutiveSixes
        };
      } else {
        // No valid moves, switch to next player
        logger.log('No valid moves available, switching to next player');
        const nextPlayer = (state.currentPlayer + 1) % state.numberOfPlayers;
        logger.log('Switching from player', state.currentPlayer, 'to player', nextPlayer);
        return {
          ...state,
          currentPlayer: nextPlayer,
          diceValue: 0,
          moveRequired: false,
          consecutiveSixes: 0,
          turnHistory: [...state.turnHistory, {
            player: state.currentPlayer,
            action: 'no_moves_available',
            diceValue: newDiceValue,
            timestamp: Date.now()
          }]
        };
      }
    }

    case GAME_ACTIONS.MOVE_PIECE: {
      const { playerIndex, pieceIndex, newPosition } = action.payload;
      
      logger.log('Moving piece:', { playerIndex, pieceIndex, newPosition });
      
      const newPlayers = [...state.players];
      const oldPosition = newPlayers[playerIndex].pieces[pieceIndex];
      
      // Get the target position on the board
      const player = newPlayers[playerIndex];
      const targetBoardPosition = getPiecePosition(player.color, newPosition);
      
      // Check for captures before moving the piece
      let capturedPieces = [];
      if (targetBoardPosition) {
        const [targetRow, targetCol] = targetBoardPosition;
        capturedPieces = findCapturablePieces(state, targetRow, targetCol, playerIndex);
      }
      
      // Move the piece
      newPlayers[playerIndex].pieces[pieceIndex] = newPosition;
      
      // Handle captures
      let captureHistory = [];
      capturedPieces.forEach(capturedPiece => {
        logger.log('Capturing piece:', capturedPiece);
        // Send captured piece back to home
        newPlayers[capturedPiece.playerIndex].pieces[capturedPiece.pieceIndex] = GAME_CONSTANTS.HOME_POSITION;
        
        captureHistory.push({
          action: 'piece_captured',
          capturedPlayer: capturedPiece.playerIndex,
          capturedPiece: capturedPiece.pieceIndex,
          capturingPlayer: playerIndex,
          capturingPiece: pieceIndex,
          timestamp: Date.now()
        });
      });
      
      // Check if player won
      const playerWon = hasPlayerWon(newPlayers[playerIndex]);
      
      // Determine if player gets another turn (rolled 6 and didn't win, or captured a piece)
      const getsAnotherTurn = (state.diceValue === GAME_CONSTANTS.WINNING_DICE_VALUE || capturedPieces.length > 0) && !playerWon;
      
      const nextPlayer = getsAnotherTurn ? state.currentPlayer : (state.currentPlayer + 1) % state.numberOfPlayers;
      
      const moveHistoryEntry = {
        player: playerIndex,
        pieceIndex,
        from: oldPosition,
        to: newPosition,
        diceValue: state.diceValue,
        capturedPieces: capturedPieces.length,
        timestamp: Date.now()
      };
      
      let newState = {
        ...state,
        players: newPlayers,
        currentPlayer: nextPlayer,
        diceValue: 0,
        moveRequired: false,
        consecutiveSixes: getsAnotherTurn ? state.consecutiveSixes : 0,
        moveHistory: [...state.moveHistory, moveHistoryEntry],
        turnHistory: [...state.turnHistory, {
          player: playerIndex,
          action: 'piece_moved',
          ...moveHistoryEntry
        }, ...captureHistory]
      };
      
      // Handle game win
      if (playerWon) {
        newState = {
          ...newState,
          gameStatus: GAME_STATUS.FINISHED,
          winner: playerIndex,
          gameEndTime: Date.now()
        };
        logger.log('Player won!', playerIndex);
      }
      
      return newState;
    }

    case GAME_ACTIONS.SET_DICE_VALUE:
      return {
        ...state,
        diceValue: action.payload.value
      };

    case GAME_ACTIONS.SWITCH_PLAYER:
      return {
        ...state,
        currentPlayer: action.payload.playerIndex,
        moveRequired: false,
        consecutiveSixes: 0,
        // Update isMyTurn based on network mode
        isMyTurn: state.networkMode === NETWORK_MODE.LOCAL 
          ? true 
          : action.payload.playerIndex === state.playerId
      };

    case GAME_ACTIONS.SET_MOVE_REQUIRED:
      return {
        ...state,
        moveRequired: action.payload.required
      };

    case GAME_ACTIONS.UPDATE_PIECE_POSITION: {
      const { playerIndex, pieceIndex, position } = action.payload;
      const newPlayers = [...state.players];
      newPlayers[playerIndex].pieces[pieceIndex] = position;
      
      return {
        ...state,
        players: newPlayers
      };
    }

    case GAME_ACTIONS.CAPTURE_PIECE: {
      const { capturedPlayerIndex, capturedPieceIndex } = action.payload;
      const newPlayers = [...state.players];
      
      // Send captured piece back to home
      newPlayers[capturedPlayerIndex].pieces[capturedPieceIndex] = GAME_CONSTANTS.HOME_POSITION;
      
      return {
        ...state,
        players: newPlayers,
        moveHistory: [...state.moveHistory, {
          action: 'piece_captured',
          capturedPlayer: capturedPlayerIndex,
          capturedPiece: capturedPieceIndex,
          timestamp: Date.now()
        }]
      };
    }

    case GAME_ACTIONS.WIN_GAME:
      return {
        ...state,
        gameStatus: GAME_STATUS.FINISHED,
        winner: action.payload.winnerIndex,
        gameEndTime: Date.now()
      };

    // WebRTC network actions
    case GAME_ACTIONS.SET_NETWORK_MODE:
      return {
        ...state,
        networkMode: action.payload.mode,
        // Reset network-related state when changing modes
        connectionStatus: action.payload.mode === NETWORK_MODE.LOCAL 
          ? CONNECTION_STATUS.DISCONNECTED 
          : state.connectionStatus,
        playerId: action.payload.mode === NETWORK_MODE.LOCAL ? null : state.playerId,
        isMyTurn: action.payload.mode === NETWORK_MODE.LOCAL ? true : state.isMyTurn
      };

    case GAME_ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload.status
      };

    case GAME_ACTIONS.SET_PLAYER_ID:
      return {
        ...state,
        playerId: action.payload.playerId,
        // Update isMyTurn based on current player and player ID
        isMyTurn: state.currentPlayer === action.payload.playerId
      };

    case GAME_ACTIONS.SYNC_GAME_STATE: {
      const { gameState } = action.payload;
      return {
        ...state,
        ...gameState,
        // Preserve local network state
        networkMode: state.networkMode,
        connectionStatus: state.connectionStatus,
        playerId: state.playerId,
        channelName: state.channelName,
        // Update isMyTurn based on synced state
        isMyTurn: gameState.currentPlayer === state.playerId
      };
    }

    default:
      logger.warn('Unknown action type:', action.type);
      return state;
  }
};
