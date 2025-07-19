# WebRTC Multiplayer Guide

This Ludo game now supports WebRTC-based peer-to-peer multiplayer functionality using the `@nkg447/signallite` library.

## Features

- **Real-time multiplayer**: Play with friends over the internet without a central game server
- **Peer-to-peer communication**: Direct connection between players using WebRTC
- **Action synchronization**: All game actions are automatically broadcasted to connected peers
- **Turn-based validation**: Only the current player can make moves in multiplayer mode

## How to Play Multiplayer

### Hosting a Game

1. Click "Host Game" in the Network Manager section
2. Either enter a custom channel name or click "Generate" for a random one
3. Click "Start Hosting" to create the game session
4. Share the channel name with your friend
5. Wait for your friend to connect
6. Start the game once connected

### Joining a Game

1. Get the channel name from the host
2. Click "Join Game" in the Network Manager section
3. Enter the channel name provided by the host
4. Click "Join Game" to connect
5. Wait for the host to start the game

## Network States

- **LOCAL**: Single-player or local multiplayer mode
- **HOST**: Hosting a multiplayer game (Player 1)
- **GUEST**: Joined someone else's game (Player 2)

## Connection Status

- **DISCONNECTED**: Not connected to any peers
- **CONNECTING**: Attempting to establish connection
- **CONNECTED**: Successfully connected to peer(s)
- **ERROR**: Connection failed

## Technical Implementation

### WebRTC Service (`src/services/webrtcService.js`)

The WebRTC service handles:
- Peer connection establishment using signallite
- Message broadcasting and receiving
- Connection state management
- Action synchronization between peers

### Game State Integration

The game state has been enhanced with:
- Network mode tracking
- Connection status monitoring
- Player ID assignment
- Turn validation for multiplayer

### Action Broadcasting

Game actions are selectively broadcasted to connected peers:
- `START_GAME` - Game initialization
- `SET_DICE_VALUE` - Dice roll results (instead of ROLL_DICE to prevent multiple random values)
- `SET_MOVE_REQUIRED` - Move requirement status
- `MOVE_PIECE` - Piece movement
- `SWITCH_PLAYER` - Turn switching
- `CAPTURE_PIECE` - Piece capturing
- `WIN_GAME` - Game completion

Note: `ROLL_DICE` actions are NOT broadcasted to prevent each peer from generating different random dice values. Instead, only the resulting dice value and game state changes are synchronized.

### Turn Management

In multiplayer mode:
- Only the current player can perform actions
- The `isMyTurn` state indicates if it's your turn
- UI elements are disabled when it's not your turn
- Actions are validated both locally and on peers

## Troubleshooting

### Connection Issues

1. **Cannot connect**: Ensure both players are using the same channel name
2. **Connection drops**: Check internet connectivity and firewall settings
3. **Signaling server unreachable**: The default server is `https://signallite.nikunjgupta.dev`

### Game Sync Issues

1. **State mismatch**: One player can disconnect and reconnect
2. **Actions not propagating**: Check browser console for WebRTC errors
3. **Turn confusion**: Refresh both browsers to reset state

## Security Notes

- All communication is peer-to-peer through WebRTC
- The signaling server only facilitates initial connection
- No game data is stored on external servers
- Connections are encrypted by default with WebRTC DTLS

