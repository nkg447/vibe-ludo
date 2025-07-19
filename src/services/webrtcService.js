import WebRTCClient from '@nkg447/signallite';
import logger from '../logger';

/**
 * WebRTC Service for multiplayer Ludo game
 * Handles peer-to-peer communication for game state synchronization
 */
class WebRTCService {
  constructor() {
    this.client = null;
    this.isHost = false;
    this.isConnected = false;
    this.peers = new Set();
    this.actionCallbacks = new Set();
    this.connectionCallbacks = new Set();
    this.channel = null;
    this.channelName = null;
    this.signalingServerUrl = 'https://signallite.nikunjgupta.dev';
  }

  /**
   * Initialize WebRTC connection
   * @param {string} channelName - The channel name for the game session
   * @param {boolean} createOffer - Whether this peer should create an offer (host)
   */
  async connect(channelName, createOffer = false) {
    if (this.isConnected) {
      logger.log('Already connected to WebRTC');
      return;
    }

    this.channelName = channelName;
    this.isHost = createOffer;

    try {
      logger.log(`Connecting to WebRTC channel: ${channelName}, as ${createOffer ? 'host' : 'guest'}`);

      this.client = new WebRTCClient(
        this.signalingServerUrl,
        channelName,
        this.onMessage.bind(this),
        this.onPeerConnect.bind(this)
      );

      if (createOffer) {
        await this.client.createOffer();
        logger.log('WebRTC offer created');
      }

    } catch (error) {
      logger.error('Failed to connect to WebRTC:', error);
      throw error;
    }
  }

  /**
   * Handle incoming messages from peers
   */
  onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      logger.log('Received WebRTC message:', data);

      if (data.type === 'GAME_ACTION') {
        // Notify all registered action callbacks
        this.actionCallbacks.forEach(callback => {
          callback(data.action);
        });
      }
    } catch (error) {
      logger.error('Failed to parse WebRTC message:', error);
    }
  }

  /**
   * Handle peer connection establishment
   */
  onPeerConnect(channel) {
    this.channel = channel;
    this.isConnected = true;
    logger.log('WebRTC peer connected');

    // Notify connection callbacks
    this.connectionCallbacks.forEach(callback => {
      callback(true);
    });
  }

  /**
   * Broadcast a game action to all connected peers
   * @param {Object} action - The Redux action to broadcast
   */
  broadcastAction(action) {
    if (!this.isConnected || !this.channel) {
      logger.log('Cannot broadcast - not connected to peers');
      return;
    }

    try {
      const message = {
        type: 'GAME_ACTION',
        action: action,
        timestamp: Date.now(),
        sender: this.isHost ? 'host' : 'guest'
      };

      this.channel.send(JSON.stringify(message));
      logger.log('Broadcasted action:', action.type);
    } catch (error) {
      logger.error('Failed to broadcast action:', error);
    }
  }

  /**
   * Register a callback for incoming game actions
   * @param {Function} callback - Function to call when action is received
   */
  onActionReceived(callback) {
    this.actionCallbacks.add(callback);
    return () => this.actionCallbacks.delete(callback);
  }

  /**
   * Register a callback for connection status changes
   * @param {Function} callback - Function to call when connection status changes
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  /**
   * Disconnect from WebRTC
   */
  disconnect() {
    if (this.client) {
      // Note: The signallite library might not have a disconnect method
      // We'll handle cleanup on our side
      this.client = null;
    }
    
    this.isConnected = false;
    this.channel = null;
    this.peers.clear();
    
    // Notify connection callbacks
    this.connectionCallbacks.forEach(callback => {
      callback(false);
    });

    logger.log('Disconnected from WebRTC');
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isHost: this.isHost,
      channelName: this.channelName,
      peerCount: this.peers.size
    };
  }

  /**
   * Generate a random channel name for the game
   */
  static generateChannelName() {
    return `ludo-${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Create and export a singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;
