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
- **GAME_ACTIONS**: All action types for state updates
- **GAME_CONSTANTS**: Game configuration constants
- **PLAYER_CONFIGS**: Player configurations for different game modes
- **GAME_STATUS**: Game status enumeration

### 2. Game Actions (`gameActions.js`)
Action creators for:
- Game lifecycle (start, restart, setup)
- Turn management (roll dice, move pieces, switch players)
- Game state updates (piece positions, captures, wins)
- Audio control (play, pause, stop audio tracks)
- Network synchronization (WebRTC multiplayer)

### 3. Game Reducer (`gameReducer.js`)
Central reducer handling all game state transitions:
- Player setup and game initialization
- Dice rolling and move validation
- Piece movement and capture logic
- Win condition checking
- Turn switching logic
- Audio state management and synchronization
- Network game state coordination

### 4. Game Utils (`gameUtils.js`)
Utility functions for:
- Board path calculations
- Move validation
- Position calculations
- Win condition checking
- Piece capture logic

### 5. Game Context (`GameContext.js`)
- React Context provider wrapping the entire game
- Enhanced action dispatchers with logging
- Centralized state and action access
- WebRTC network action broadcasting
- Audio synchronization across connected players

### 6. Game Hooks (`gameHooks.js`)
Custom hooks for components:
- **useGameSelectors**: Access game state with computed values
- **useGameActions**: Access game actions with validation
- **useBoardLogic**: Board-specific logic and helpers

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

## Game Logic Enhancements

### Enhanced Features
1. **Move History**: Track all player moves
2. **Turn History**: Track game events
3. **Consecutive Sixes**: Prevent infinite turns
4. **Win Detection**: Automatic game end detection
5. **Player Statistics**: Track individual player performance
6. **Audio Broadcasting**: Synchronized audio playback across players
7. **Network Multiplayer**: Real-time game state synchronization

### Validation Logic
- Move validation before state updates
- Turn switching based on game rules
- Piece capture detection
- Win condition checking
- Audio state consistency across network players
- Network action validation and synchronization

## Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Easy to add new features
3. **Testability**: Pure functions for game logic
4. **Debugging**: Centralized logging and state tracking
5. **Performance**: Optimized re-renders and state access

## Future Enhancements

The state management system is designed to easily support:
- Enhanced multiplayer features (rooms, lobbies)
- Game persistence and loading
- Replay functionality with audio
- AI players
- Custom game rules
- Tournament mode
- Voice chat integration
- Advanced audio features (playlists, sound effects)
