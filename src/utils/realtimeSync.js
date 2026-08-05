import Peer from 'peerjs';

class RealtimeSyncManager {
  constructor() {
    this.broadcastChannel = null;
    this.peer = null;
    this.connections = [];
    this.roomId = 'BLUE-BREEZE-TEAM-ROOM';
    this.isHost = false;
    this.onStateReceivedCallback = null;
    this.onPeerCountChangeCallback = null;
    this.lastReceivedTimestamp = 0;

    this.initBroadcastChannel();
  }

  // Local Cross-Tab Sync via BroadcastChannel
  initBroadcastChannel() {
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('blue_breeze_billing_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE') {
          if (
            this.onStateReceivedCallback &&
            event.data.timestamp > this.lastReceivedTimestamp
          ) {
            this.lastReceivedTimestamp = event.data.timestamp;
            this.onStateReceivedCallback(event.data.payload, 'Local Tab');
          }
        }
      };
    }
  }

  // Broadcast to other tabs locally
  broadcastLocal(state) {
    const timestamp = Date.now();
    this.lastReceivedTimestamp = timestamp;
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATE',
        payload: state,
        timestamp: timestamp,
      });
    }
  }

  // Connect to P2P PeerJS room for multi-browser / multi-device sharing
  connectRoom(roomId, onStateReceived, onPeerCountChange) {
    this.roomId = roomId || this.roomId;
    this.onStateReceivedCallback = onStateReceived;
    this.onPeerCountChangeCallback = onPeerCountChange;

    const hostPeerId = `BB-ROOM-${this.roomId.replace(/[^a-zA-Z0-9]/g, '')}-HOST`;
    const clientPeerId = `BB-ROOM-${this.roomId.replace(/[^a-zA-Z0-9]/g, '')}-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Try becoming Host first
    this.tryAsHost(hostPeerId, clientPeerId);
  }

  tryAsHost(hostPeerId, clientPeerId) {
    try {
      this.peer = new Peer(hostPeerId, { debug: 1 });

      this.peer.on('open', (id) => {
        console.log('Registered as Host Peer ID:', id);
        this.isHost = true;
        this.notifyPeerCount();

        // Listen for incoming client connections
        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });
      });

      this.peer.on('error', (err) => {
        // If Host ID is taken (error 'unavailable-id'), become a Client!
        if (err.type === 'unavailable-id') {
          console.log('Host already active. Joining room as Client...');
          this.peer.destroy();
          this.connectAsClient(hostPeerId, clientPeerId);
        }
      });
    } catch (err) {
      console.warn('Host registration note:', err);
      this.connectAsClient(hostPeerId, clientPeerId);
    }
  }

  connectAsClient(hostPeerId, clientPeerId) {
    try {
      this.peer = new Peer(clientPeerId, { debug: 1 });

      this.peer.on('open', () => {
        console.log('Client connected. Connecting to Host:', hostPeerId);
        this.isHost = false;

        const conn = this.peer.connect(hostPeerId);
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('Client peer error:', err);
      });
    } catch (err) {
      console.error('Failed to initialize client peer:', err);
    }
  }

  setupConnection(conn) {
    conn.on('open', () => {
      console.log('P2P Connection established with:', conn.peer);
      this.connections.push(conn);
      this.notifyPeerCount();
    });

    conn.on('data', (data) => {
      if (data && data.type === 'SYNC_STATE') {
        if (data.timestamp > this.lastReceivedTimestamp) {
          this.lastReceivedTimestamp = data.timestamp;
          if (this.onStateReceivedCallback) {
            this.onStateReceivedCallback(data.payload, conn.peer);
          }
        }

        // If I am Host, relay this update to all other connected clients!
        if (this.isHost) {
          this.connections.forEach((otherConn) => {
            if (otherConn !== conn && otherConn.open) {
              otherConn.send(data);
            }
          });
        }
      }
    });

    conn.on('close', () => {
      this.connections = this.connections.filter((c) => c !== conn);
      this.notifyPeerCount();
    });
  }

  // Broadcast state to all connected peers and local tabs
  broadcastState(state) {
    const timestamp = Date.now();
    this.lastReceivedTimestamp = timestamp;

    // 1. Local tabs
    this.broadcastLocal(state);

    // 2. Connected P2P peers
    const payload = {
      type: 'SYNC_STATE',
      payload: state,
      timestamp: timestamp,
    };

    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  notifyPeerCount() {
    if (this.onPeerCountChangeCallback) {
      this.onPeerCountChangeCallback(this.connections.length + 1);
    }
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
