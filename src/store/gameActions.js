import { GAME_ACTIONS } from './gameTypes';

// Action creators for game state management
export const gameActions = {
  // Game lifecycle actions
  startGame: (numberOfPlayers) => ({
    type: GAME_ACTIONS.START_GAME,
    payload: { numberOfPlayers }
  }),

  restartGame: () => ({
    type: GAME_ACTIONS.RESTART_GAME
  }),

  setPlayerCount: (count) => ({
    type: GAME_ACTIONS.SET_PLAYER_COUNT,
    payload: { count }
  }),

  // Turn management actions
  rollDice: () => ({
    type: GAME_ACTIONS.ROLL_DICE
  }),

  setDiceValue: (value) => ({
    type: GAME_ACTIONS.SET_DICE_VALUE,
    payload: { value }
  }),

  movePiece: (playerIndex, pieceIndex, newPosition) => ({
    type: GAME_ACTIONS.MOVE_PIECE,
    payload: { playerIndex, pieceIndex, newPosition }
  }),

  switchPlayer: (playerIndex) => ({
    type: GAME_ACTIONS.SWITCH_PLAYER,
    payload: { playerIndex }
  }),

  setMoveRequired: (required) => ({
    type: GAME_ACTIONS.SET_MOVE_REQUIRED,
    payload: { required }
  }),

  // Game state actions
  updatePiecePosition: (playerIndex, pieceIndex, position) => ({
    type: GAME_ACTIONS.UPDATE_PIECE_POSITION,
    payload: { playerIndex, pieceIndex, position }
  }),

  capturePiece: (capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex) => ({
    type: GAME_ACTIONS.CAPTURE_PIECE,
    payload: { capturedPlayerIndex, capturedPieceIndex, capturingPlayerIndex }
  }),

  winGame: (winnerIndex) => ({
    type: GAME_ACTIONS.WIN_GAME,
    payload: { winnerIndex }
  }),

  // WebRTC network actions
  setNetworkMode: (mode) => ({
    type: GAME_ACTIONS.SET_NETWORK_MODE,
    payload: { mode }
  }),

  setConnectionStatus: (status) => ({
    type: GAME_ACTIONS.SET_CONNECTION_STATUS,
    payload: { status }
  }),

  setPlayerId: (playerId) => ({
    type: GAME_ACTIONS.SET_PLAYER_ID,
    payload: { playerId }
  }),

  syncGameState: (gameState) => ({
    type: GAME_ACTIONS.SYNC_GAME_STATE,
    payload: { gameState }
  })
};
