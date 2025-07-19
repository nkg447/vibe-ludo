import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { NETWORK_MODE, CONNECTION_STATUS } from '../../store/gameTypes';
import './NetworkDebugger.css';

const NetworkDebugger = () => {
  const { gameState, actions } = useGame();
  const [logs, setLogs] = useState([]);
  const [maxLogs] = useState(10);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { timestamp, message, type },
      ...prev.slice(0, maxLogs - 1)
    ]);
  };

  useEffect(() => {
    addLog(`Network mode changed to: ${gameState.networkMode}`, 'info');
  }, [gameState.networkMode]);

  useEffect(() => {
    addLog(`Connection status: ${gameState.connectionStatus}`, 'status');
  }, [gameState.connectionStatus]);

  useEffect(() => {
    if (gameState.playerId !== null) {
      addLog(`Player ID assigned: ${gameState.playerId}`, 'success');
    }
  }, [gameState.playerId]);

  useEffect(() => {
    addLog(`Turn changed - Current: ${gameState.currentPlayer}, My turn: ${gameState.isMyTurn}`, 'turn');
  }, [gameState.currentPlayer, gameState.isMyTurn]);

  const testBroadcast = () => {
    // Test broadcasting by rolling dice (if it's our turn)
    const result = actions.rollDice();
    addLog(`Test broadcast: Roll dice ${result ? 'succeeded' : 'failed'}`, result ? 'success' : 'error');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogClass = (type) => {
    switch (type) {
      case 'success': return 'log-success';
      case 'error': return 'log-error';
      case 'turn': return 'log-turn';
      case 'status': return 'log-status';
      default: return 'log-info';
    }
  };

  // Check if debug query parameter is set to true
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get('debug') === 'true';

  if (!isDebugMode) {
    return null; // Only show when debug=true in URL
  }

  return (
    <div className="network-debugger">
      <div className="debugger-header">
        <h3>Network Debug Console</h3>
        <div className="debugger-controls">
          <button onClick={testBroadcast} disabled={gameState.networkMode === NETWORK_MODE.LOCAL}>
            Test Broadcast
          </button>
          <button onClick={clearLogs}>Clear</button>
        </div>
      </div>

      <div className="network-state">
        <div className="state-item">
          <strong>Mode:</strong> {gameState.networkMode}
        </div>
        <div className="state-item">
          <strong>Status:</strong> {gameState.connectionStatus}
        </div>
        <div className="state-item">
          <strong>Player ID:</strong> {gameState.playerId ?? 'None'}
        </div>
        <div className="state-item">
          <strong>Current Player:</strong> {gameState.currentPlayer}
        </div>
        <div className="state-item">
          <strong>My Turn:</strong> {gameState.isMyTurn ? 'Yes' : 'No'}
        </div>
      </div>

      <div className="logs-container">
        <h4>Activity Logs</h4>
        <div className="logs">
          {logs.length === 0 ? (
            <div className="no-logs">No activity yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`log-entry ${getLogClass(log.type)}`}>
                <span className="log-timestamp">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkDebugger;
