# Ludo Game - State Management Documentation

## Overview

The Ludo Game now features a comprehensive state management system built with React Context and useReducer. The state management is organized into separate modules for better maintainability and scalability.

## State Management Architecture

### Directory Structure
```
src/store/
├── index.js          # Central export file
├── gameTypes.js      # Action types and constants
├── gameActions.js    # Action creators
├── gameReducer.js    # Main game reducer
├── gameUtils.js      # Game logic utilities
├── GameContext.js    # React Context provider
└── gameHooks.js      # Custom hooks for components
```

## Core Modules

### 1. Game Types (`gameTypes.js`)
- **GAME_ACTIONS**: All action types for state updates (including animation, network, and audio actions)
- **GAME_CONSTANTS**: Game configuration constants (board size, piece counts, winning conditions, animation timing)
- **PLAYER_CONFIGS**: Player configurations for different game modes (2, 3, 4 players)
- **GAME_STATUS**: Game status enumeration (SETUP, IN_PROGRESS, FINISHED, PAUSED)
- **NETWORK_MODE**: Network connection modes (LOCAL, HOST, GUEST)
- **CONNECTION_STATUS**: WebRTC connection states (DISCONNECTED, CONNECTING, CONNECTED, ERROR)

### 2. Game Actions (`gameActions.js`)
Action creators for:
- Game lifecycle (start, restart, setup)
- Turn management (roll dice, move pieces, switch players)
- Piece animation (start, step, end animation states)
- Game state updates (piece positions, captures, wins)
- Audio control (play, pause, stop audio tracks with player attribution)
- Network synchronization (WebRTC multiplayer state management)

### 3. Game Reducer (`gameReducer.js`)
Central reducer handling all game state transitions:
- Player setup and game initialization
- Dice rolling and move validation
- Piece movement and capture logic
- Piece animation state management (start, step, end)
- Win condition checking
- Turn switching logic with consecutive six handling
- Audio state management and synchronization
- Network game state coordination and player turn management
- Sound effects integration for game events

### 4. Game Utils (`gameUtils.js`)
Utility functions for:
- Board path calculations for each player color
- Move validation and piece positioning
- Position calculations and path traversal
- Win condition checking
- Piece capture logic and safe zone detection
- Dice value generation
- Player area detection (home zones for each color)

### 5. Game Context (`GameContext.js`)
- React Context provider wrapping the entire game
- Enhanced action dispatchers with logging
- Centralized state and action access
- WebRTC network action broadcasting
- Audio synchronization across connected players

### 6. Game Hooks (`gameHooks.js`)
Custom hooks for components:
- **useGameSelectors**: Access game state with computed values and statistics
- **useGameActions**: Access game actions with validation and piece animation
- **useBoardLogic**: Board-specific logic, piece positioning, and home area management

## Usage in Components

### Basic Usage
```javascript
import { useGameSelectors, useGameActions } from '../store';

const MyComponent = () => {
  const { 
    isGameStarted, 
    currentPlayer, 
    diceValue,
    currentAudioTrack,
    isAudioPlaying 
  } = useGameSelectors();
  
  const { 
    rollDice, 
    movePiece, 
    startGame,
    playAudio,
    pauseAudio,
    stopAudio 
  } = useGameActions();
  
  // Component logic here
};
```

### Game State Structure
```javascript
{
  // Game setup
  gameStarted: boolean,
  gameStatus: 'SETUP' | 'IN_PROGRESS' | 'FINISHED' | 'PAUSED',
  numberOfPlayers: number,
  selectedPlayerCount: number,
  
  // Players
  players: [
    {
      id: number,
      color: 'red' | 'blue' | 'yellow' | 'green',
      name: string,
      pieces: [number, number, number, number], // positions 0-57
      score: number
    }
  ],
  
  // Turn management
  currentPlayer: number,
  diceValue: number,
  moveRequired: boolean,
  consecutiveSixes: number,
  
  // Animation state
  animatingPiece: {
    playerIndex: number,
    pieceIndex: number,
    fromPosition: number,
    toPosition: number,
    currentStep: number,
    totalSteps: number,
    currentPosition: number
  } | null,
  isAnimating: boolean,
  
  // Game history
  moveHistory: Array,
  turnHistory: Array,
  
  // Game end
  winner: number | null,
  gameEndTime: number | null,
  
  // Network state (WebRTC multiplayer)
  networkMode: 'LOCAL' | 'HOST' | 'GUEST',
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR',
  playerId: number | null,
  channelName: string | null,
  isMyTurn: boolean,
  
  // Audio state
  currentAudioTrack: string | null,
  isAudioPlaying: boolean,
  audioPlayedBy: number | null
}
```

## Animation System

### Piece Movement Animation
The game features a sophisticated animation system for smooth piece movement:

```javascript
// Animation state structure
{
  animatingPiece: {
    playerIndex: number,        // Which player's piece
    pieceIndex: number,         // Which piece (0-3)
    fromPosition: number,       // Starting position
    toPosition: number,         // Ending position
    currentStep: number,        // Current animation step
    totalSteps: number,         // Total steps (dice value)
    currentPosition: number     // Current visual position
  },
  isAnimating: boolean          // Global animation state
}
```

### Animation Actions
- **START_PIECE_ANIMATION**: Initialize piece animation
- **STEP_PIECE_ANIMATION**: Advance animation by one step
- **END_PIECE_ANIMATION**: Complete animation and finalize position

### Animation Timing
- **ANIMATION_STEP_DURATION**: 300ms per step (configurable in `GAME_CONSTANTS`)
- Each dice step is visually animated with sound effects
- Move from home to start position (with dice value 6) is instant

## Sound Effects System

### Sound Effects Architecture
Located in `src/utils/soundEffects.js`, providing:
- Audio caching and preloading
- Volume control across all sound effects
- Error handling for audio playback

### Available Sound Effects
```javascript
// Game event sounds
playSwitchPlayerSound()      // When turn changes
playMoveSound()              // Each animation step
playCaptureSound()           // When piece is captured
playPieceVanishSound()       // Piece removal effects
playNoMoveAvailableSound()   // No valid moves available

// Volume control
setSoundEffectsVolume(volume)  // Set volume (0-1)
getSoundEffectsVolume()        // Get current volume
```

### Audio File Locations
```
assets/audio/effects/
├── switch_player.mp3        # Turn change sound
├── move1.mp3, move2.mp3, move3.mp3  # Movement sounds
├── capture.mp3              # Piece capture sound
├── piece_vanish.mp3         # Piece removal sound
└── no_move_available.mp3    # Invalid move sound
```

## Audio State Management

### Audio Actions
The system supports three main audio actions that are synchronized across all connected players:

```javascript
// Play audio track
actions.playAudio(trackFile);  // Broadcasts to all players

// Pause current audio
actions.pauseAudio();  // Syncs pause state

// Stop current audio
actions.stopAudio();   // Syncs stop state
```

### Audio State Structure
```javascript
{
  currentAudioTrack: 'filename.mp3' | null,  // Currently playing track
  isAudioPlaying: boolean,                   // Playing state
  audioPlayedBy: number | null               // Player who initiated audio
}
```

### Network Synchronization
- Audio state is automatically synchronized across all connected players
- When one player plays audio, all players hear the same track
- Player attribution shows who initiated the audio playback
- Audio controls are available to all players (democratic audio control)

### Implementation Details
1. **Action Broadcasting**: Audio actions are broadcast via WebRTC
2. **State Synchronization**: Audio state is maintained in the central game state
3. **Player Attribution**: Tracks which player initiated audio playback
4. **Auto-sync**: Remote audio state changes automatically update local audio player

## Key Features

### 1. Centralized State Management
- All game state is managed in a single location
- Predictable state updates through actions
- Easy debugging with action logging

### 2. Separation of Concerns
- Game logic separated from UI components
- Reusable utility functions
- Clean component interfaces

### 3. Type Safety
- Defined action types prevent typos
- Constants ensure consistency
- Clear data structures

### 4. Performance Optimized
- Efficient re-renders with proper state slicing
- Computed values in selectors
- Minimal prop drilling

### 5. Extensibility
- Easy to add new features
- Modular architecture
- Clear interfaces between modules

## Game Constants and Configuration

### Core Game Constants (`GAME_CONSTANTS`)
```javascript
{
  BOARD_SIZE: 15,                    // 15x15 game board
  PIECES_PER_PLAYER: 4,              // 4 pieces per player
  MAX_POSITION: 57,                  // Maximum position value
  HOME_POSITION: 0,                  // Home/start position
  WINNING_DICE_VALUE: 6,             // Dice value needed to start/win
  TOTAL_PATH_LENGTH: 56,             // Total path length
  ANIMATION_STEP_DURATION: 300       // Animation timing in milliseconds
}
```

### Player Configurations
Support for 2, 3, and 4 player games:
- **2 Players**: Red vs Yellow
- **3 Players**: Red, Blue, Yellow
- **4 Players**: Red, Blue, Yellow, Green

### Network Modes and Connection States
```javascript
// Network operation modes
NETWORK_MODE: {
  LOCAL: 'LOCAL',        // Single device gameplay
  HOST: 'HOST',          // Hosting a multiplayer game
  GUEST: 'GUEST'         // Joining a multiplayer game
}

// WebRTC connection states
CONNECTION_STATUS: {
  DISCONNECTED: 'DISCONNECTED',  // Not connected
  CONNECTING: 'CONNECTING',      // Attempting connection
  CONNECTED: 'CONNECTED',        // Successfully connected
  ERROR: 'ERROR'                 // Connection failed
}
```

## Enhanced Game Logic

### Game Features
1. **Piece Animation System**: Smooth visual piece movement with step-by-step animation
2. **Move History Tracking**: Complete record of all player moves with timestamps
3. **Turn History**: Detailed game event logging
4. **Consecutive Sixes Handling**: Prevents infinite turns from repeated sixes
5. **Win Detection**: Automatic game end detection when all pieces reach home
6. **Player Statistics**: Individual performance tracking and game duration
7. **Audio Broadcasting**: Synchronized audio playback across network players
8. **Network Multiplayer**: Real-time game state synchronization via WebRTC
9. **Sound Effects Integration**: Contextual audio feedback for game events

### Validation Logic
- Move validation before state updates
- Turn switching based on game rules
- Piece capture detection
- Win condition checking
- Audio state consistency across network players
- Network action validation and synchronization
- Animation state management to prevent conflicts

### Board Path System
Each player color has a defined path with 56 positions plus home stretch:
- **Path Calculation**: Dynamic position calculation based on player color
- **Home Area Detection**: Specific zones for each player's home pieces
- **Safe Zone Mapping**: Protected positions where pieces cannot be captured
- **Target Position Validation**: Ensures pieces don't exceed maximum positions

## WebRTC Multiplayer System

### Network Architecture
- **Host-Guest Model**: One player hosts, others join via channel name
- **Real-time Synchronization**: Game state synced across all connected players
- **Action Broadcasting**: Game actions automatically broadcast to all players
- **Turn Management**: Only the current player can perform actions
- **Connection Resilience**: Automatic reconnection and error handling

### Channel System
```javascript
// Generate unique channel name
const channelName = webrtcService.generateChannelName();

// Host game
await actions.hostGame(channelName);

// Join game
await actions.joinGame(channelName);
```

### Network State Management
- **Player ID Assignment**: Host gets ID 0, guests get sequential IDs
- **Turn Synchronization**: `isMyTurn` flag manages turn-based gameplay
- **State Broadcasting**: Critical actions like dice rolls and moves are synced
- **Audio Synchronization**: Audio state is shared across all players

## Logging and Debugging

### Centralized Logging
The game uses a centralized logging system (`logger.js`) for:
- **Action Tracking**: All game actions are logged with timestamps
- **Network Events**: WebRTC connection events and data transfer
- **Error Handling**: Comprehensive error logging and debugging info
- **Performance Monitoring**: Game state changes and validation results

### Debug Features
- **Network Debugger Component**: Real-time network state visualization
- **Game Statistics**: Comprehensive game metrics and player performance
- **Action History**: Complete audit trail of all game events

## Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns with modular architecture
2. **Scalability**: Easy to add new features with defined interfaces
3. **Testability**: Pure functions for game logic enable comprehensive testing
4. **Debugging**: Centralized logging and state tracking with network debugging tools
5. **Performance**: Optimized re-renders and state access with animation management
6. **Real-time Multiplayer**: Seamless WebRTC integration for network gameplay
7. **Audio Experience**: Synchronized audio system enhancing gameplay immersion

## Future Enhancements

The state management system is designed to easily support:
- Enhanced multiplayer features (game rooms, lobbies)
- Game persistence and loading
- Replay functionality with audio
- AI players
- Custom game rules
- Tournament mode
- Voice chat integration
- Advanced audio features (playlists, sound effects)
