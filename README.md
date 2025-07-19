# Ludo Game - React Implementation

A fully functional Ludo board game built with React, featuring modern state management, responsive design, and traditional Ludo gameplay rules.

## 🎮 Game Overview

This is a complete implementation of the classic Ludo board game, supporting 2-4 players with authentic game mechanics including:
- Traditional 15x15 board layout
- Four colored player pieces (Red, Blue, Yellow, Green)
- Dice rolling mechanics with special rules for sixes
- Piece movement, capturing, and safe zones
- Win conditions and game state management

## 🚀 Features

### Core Gameplay
- **Multi-player Support**: 2, 3, or 4 player games
- **Authentic Rules**: Traditional Ludo rules implementation
- **Dice Mechanics**: 
  - Roll 6 to move pieces out of home
  - Get extra turn on rolling 6
  - Three consecutive 6s penalty (lose turn)
- **Piece Movement**: Click-to-move interface with validation
- **Capturing**: Opponent pieces sent back to home when captured
- **Safe Zones**: Protected positions marked with stars
- **Win Condition**: First player to get all 4 pieces to finish line wins

### Technical Features
- **Modern React Architecture**: Hooks, Context API, and functional components
- **Advanced State Management**: Custom Redux-like pattern with useReducer
- **Responsive Design**: Mobile-friendly layout
- **Game Statistics**: Move tracking, player statistics, and game history
- **Debug Logging**: Development mode logging for debugging
- **Type Safety**: Well-defined action types and constants

## 📁 Project Structure

```
src/
├── App.js                 # Main application component
├── App.css                # Global app styles
├── index.js               # React DOM rendering
├── logger.js              # Development logging utility
├── components/
│   ├── LudoGame.js        # Main game component with setup and game screens
│   ├── LudoGame.css       # Game layout and styling
│   ├── Board/
│   │   ├── Board.js       # Game board component (15x15 grid)
│   │   └── Board.css      # Board styling with colors and animations
│   ├── Dice/
│   │   ├── Dice.js        # Dice component with dot patterns
│   │   └── Dice.css       # Dice styling and animations
│   └── GameStats/
│       ├── GameStats.js   # Game statistics and move history
│       └── GameStats.css  # Statistics panel styling
└── store/                 # State management system
    ├── index.js          # Central exports
    ├── gameTypes.js      # Action types and constants
    ├── gameActions.js    # Action creators
    ├── gameReducer.js    # Main game state reducer
    ├── gameUtils.js      # Game logic utilities
    ├── GameContext.js    # React Context provider
    └── gameHooks.js      # Custom hooks for components
```

## 🛠️ State Management Architecture

The game uses a sophisticated state management system built on React Context and useReducer:

### Key Modules:
- **GameContext**: Provides game state and actions to all components
- **gameReducer**: Handles all state transitions and game logic
- **gameHooks**: Custom hooks for component integration
- **gameUtils**: Pure functions for game calculations
- **gameTypes**: Type definitions and constants

### Custom Hooks:
- `useGameSelectors()`: Access game state with computed values
- `useGameActions()`: Access game actions with validation
- `useBoardLogic()`: Board-specific logic and helpers

## 🎯 Game Rules Implementation

### Board Layout
- **15x15 Grid**: Classic Ludo board with 4 colored home areas
- **Path System**: Each player has a 57-step path around the board
- **Home Areas**: 5x5 colored areas where pieces start
- **Safe Zones**: Protected positions (starting positions + 8th positions)
- **Center Area**: Multi-colored finish area

### Movement Rules
- **Starting**: Roll 6 to move pieces out of home
- **Regular Movement**: Move pieces forward by dice value
- **Capturing**: Land on opponent's piece to send it home
- **Safe Positions**: Pieces cannot be captured on starred positions
- **Home Stretch**: Final 6 positions leading to center
- **Winning**: Get all 4 pieces to position 57

### Turn Management
- **Extra Turns**: Get another turn when rolling 6
- **Penalty**: Lose turn after 3 consecutive 6s
- **Must Move**: Must move a piece if valid moves available
- **Auto-Skip**: Turn passes if no valid moves available

## 🎨 Styling and UI

### Design Features
- **Gradient Backgrounds**: Modern visual appeal
- **Color-coded Players**: Red, Blue, Yellow, Green themes
- **Interactive Elements**: Hover effects and animations
- **Responsive Layout**: Mobile and desktop compatible
- **Game Feedback**: Visual indicators for movable pieces
- **Smooth Animations**: CSS transitions and keyframe animations

### Player Colors
- **Red**: #e74c3c (starting position: top-left)
- **Blue**: #3498db (starting position: bottom-left)  
- **Yellow**: #f1c40f (starting position: bottom-right)
- **Green**: #27ae60 (starting position: top-right)

## 📊 Game Statistics

The game tracks comprehensive statistics:
- **Game Duration**: Real-time game timer
- **Move Count**: Total and per-player move tracking
- **Piece Status**: Home, in-play, and finished piece counts
- **Move History**: Last 5 moves with player and dice information
- **Turn History**: Complete game event log

## 🧪 Development Features

### Logging System
- Development-only console logging
- Action tracking and state changes
- Error and warning messages
- Performance monitoring

### Debugging Tools
- State inspection through React DevTools
- Action history tracking
- Move validation logging
- Game event timeline

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd ludo-game

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts
```bash
npm start    # Start development server (http://localhost:3000)
npm build    # Create production build
npm test     # Run test suite
npm eject    # Eject from Create React App (not recommended)
```

## 🎮 How to Play

1. **Game Setup**:
   - Select number of players (2, 3, or 4)
   - Click "Start Game" to begin

2. **Gameplay**:
   - Click "Roll Dice" to roll the dice
   - Click on your pieces to move them (if valid moves available)
   - Follow traditional Ludo rules

3. **Winning**:
   - Get all 4 pieces to the center to win
   - Game announces winner and allows restart

## 🔧 Technical Dependencies

### Main Dependencies
- **React 19.1.0**: Core framework
- **@nkg447/signallite 0.0.2**: State management utility
- **react-scripts 5.0.1**: Build tooling

### Testing Dependencies
- **@testing-library/react**: Component testing
- **@testing-library/jest-dom**: DOM testing utilities
- **@testing-library/user-event**: User interaction testing

## 🏗️ Architecture Highlights

### Component Design
- **Separation of Concerns**: Clear boundaries between UI and logic
- **Reusable Components**: Modular design for maintainability
- **Props Validation**: Type-safe prop interfaces
- **Performance Optimized**: Efficient re-rendering patterns

### State Management
- **Centralized State**: Single source of truth
- **Immutable Updates**: Predictable state changes
- **Action-based**: Redux-like action patterns
- **Computed Values**: Derived state through selectors

### Code Quality
- **ESLint Integration**: Code quality enforcement
- **Functional Programming**: Pure functions for game logic
- **Error Handling**: Graceful error management
- **Logging**: Comprehensive debugging support

## 🔮 Future Enhancements

The architecture supports future features like:
- **Online Multiplayer**: Real-time game synchronization
- **AI Players**: Computer-controlled opponents
- **Game Persistence**: Save/load game functionality
- **Replay System**: Game replay and analysis
- **Tournament Mode**: Multi-game tournaments
- **Custom Rules**: Configurable game variations

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is private and not licensed for public use.

---

**Repository**: vibe-ludo  
**Owner**: nkg447  
**Branch**: master