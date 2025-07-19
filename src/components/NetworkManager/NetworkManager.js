import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { NETWORK_MODE, CONNECTION_STATUS } from '../../store/gameTypes';
import webrtcService from '../../services/webrtcService';
import './NetworkManager.css';

const NetworkManager = () => {
  const { gameState, actions } = useGame();
  const [channelInput, setChannelInput] = useState('');
  const [channelName, setChannelName] = useState('');
  const [showHostOptions, setShowHostOptions] = useState(false);
  const [showJoinOptions, setShowJoinOptions] = useState(false);

  const generateChannelName = () => {
    const channelName = webrtcService.constructor.generateChannelName();
    setChannelInput(channelName);
    return channelName;
  };

  const handleHostGame = async () => {
    try {
      const channelName = channelInput || generateChannelName();
      setChannelName(channelName);
      await actions.hostGame(channelName);
      setShowHostOptions(false);
    } catch (error) {
      console.error('Failed to host game:', error);
    }
  };

  const handleJoinGame = async () => {
    try {
      if (!channelInput.trim()) {
        alert('Please enter a game channel name');
        return;
      }
      await actions.joinGame(channelInput.trim());
      setShowJoinOptions(false);
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const handleDisconnect = () => {
    actions.disconnectFromNetwork();
    setShowHostOptions(false);
    setShowJoinOptions(false);
    setChannelInput('');
  };

  const isConnecting = gameState.connectionStatus === CONNECTION_STATUS.CONNECTING;
  const hasError = gameState.connectionStatus === CONNECTION_STATUS.ERROR;

  return (
    <div className="network-manager">
      <div className="network-status">
        <h3>Network Mode: {gameState.networkMode}</h3>
        {gameState.networkMode !== NETWORK_MODE.LOCAL && (
          <div className="connection-info">
            <p>Status: <span className={`status ${gameState.connectionStatus.toLowerCase()}`}>
              {gameState.connectionStatus}
            </span></p>
            {channelName && channelName.length > 0 && (
              <p>Channel: {channelName}</p>
            )}
            {gameState.playerId !== null && (
              <p>You are Player: {gameState.playerId + 1}</p>
            )}
            {gameState.channelName && (
              <p>Channel: {gameState.channelName}</p>
            )}
            {gameState.networkMode !== NETWORK_MODE.LOCAL && (
              <p>Your Turn: {gameState.isMyTurn ? 'Yes' : 'No'}</p>
            )}
          </div>
        )}
      </div>

      {gameState.networkMode === NETWORK_MODE.LOCAL && (
        <div className="network-options">
          <div className="network-buttons">
            <button 
              className="host-btn"
              onClick={() => setShowHostOptions(!showHostOptions)}
              disabled={isConnecting}
            >
              Host Game
            </button>
            <button 
              className="join-btn"
              onClick={() => setShowJoinOptions(!showJoinOptions)}
              disabled={isConnecting}
            >
              Join Game
            </button>
          </div>

          {showHostOptions && (
            <div className="host-options">
              <h4>Host a Game</h4>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Channel name (optional)"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                />
                <button onClick={generateChannelName}>Generate</button>
              </div>
              <div className="action-buttons">
                <button 
                  className="start-hosting-btn"
                  onClick={handleHostGame}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Start Hosting'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowHostOptions(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showJoinOptions && (
            <div className="join-options">
              <h4>Join a Game</h4>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter channel name"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                />
              </div>
              <div className="action-buttons">
                <button 
                  className="join-game-btn"
                  onClick={handleJoinGame}
                  disabled={isConnecting || !channelInput.trim()}
                >
                  {isConnecting ? 'Connecting...' : 'Join Game'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowJoinOptions(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState.networkMode !== NETWORK_MODE.LOCAL && (
        <div className="network-controls">
          <button 
            className="disconnect-btn"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      )}

      {hasError && (
        <div className="error-message">
          Failed to establish connection. Please try again.
        </div>
      )}
    </div>
  );
};

export default NetworkManager;
