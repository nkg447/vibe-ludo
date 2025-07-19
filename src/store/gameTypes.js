// Game action types
export const GAME_ACTIONS = {
  // Game lifecycle
  START_GAME: 'START_GAME',
  RESTART_GAME: 'RESTART_GAME',
  SET_PLAYER_COUNT: 'SET_PLAYER_COUNT',
  
  // Turn management
  ROLL_DICE: 'ROLL_DICE',
  MOVE_PIECE: 'MOVE_PIECE',
  SWITCH_PLAYER: 'SWITCH_PLAYER',
  SET_MOVE_REQUIRED: 'SET_MOVE_REQUIRED',
  
  // Game state
  SET_DICE_VALUE: 'SET_DICE_VALUE',
  UPDATE_PIECE_POSITION: 'UPDATE_PIECE_POSITION',
  CAPTURE_PIECE: 'CAPTURE_PIECE',
  WIN_GAME: 'WIN_GAME',
};

// Game constants
export const GAME_CONSTANTS = {
  BOARD_SIZE: 15,
  PIECES_PER_PLAYER: 4,
  MAX_POSITION: 57,
  HOME_POSITION: 0,
  WINNING_DICE_VALUE: 6,
  TOTAL_PATH_LENGTH: 56,
};

// Player configurations
export const PLAYER_CONFIGS = {
  2: [
    { id: 0, color: 'red', name: 'Red' },
    { id: 2, color: 'yellow', name: 'Yellow' }
  ],
  3: [
    { id: 0, color: 'red', name: 'Red' },
    { id: 1, color: 'blue', name: 'Blue' },
    { id: 2, color: 'yellow', name: 'Yellow' }
  ],
  4: [
    { id: 0, color: 'red', name: 'Red' },
    { id: 1, color: 'blue', name: 'Blue' },
    { id: 2, color: 'yellow', name: 'Yellow' },
    { id: 3, color: 'green', name: 'Green' }
  ]
};

// Game status
export const GAME_STATUS = {
  SETUP: 'SETUP',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  PAUSED: 'PAUSED'
};
