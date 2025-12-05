// WebRTC signaling layer using native WebSocket
let ws = null;
let currentRoomId = null;
let currentUserId = null;
let currentUserName = null;
let eventHandlers = {};
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001';

// Safe send wrapper to prevent CONNECTING state errors
const safeSend = (data) => {
  if (!ws) {
    console.error('❌ WebSocket not initialized');
    return Promise.resolve(false);
  }
  
  if (ws.readyState === WebSocket.CONNECTING) {
    console.warn('⚠️ WebSocket still connecting, waiting...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          ws.send(JSON.stringify(data));
          console.log('✅ Queued message sent');
          resolve(true);
        } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          clearInterval(checkInterval);
          console.error('❌ WebSocket closed before message could be sent');
          resolve(false);
        }
      }, 10);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('❌ Timeout waiting for WebSocket to open');
        resolve(false);
      }, 5000);
    });
  }
  
  if (ws.readyState !== WebSocket.OPEN) {
    console.error('❌ WebSocket not open, state:', ws.readyState);
    return Promise.resolve(false);
  }
  
  ws.send(JSON.stringify(data));
  return Promise.resolve(true);
};

export const ablySignaling = {
  // Initialize connection
  init: async (roomId, userId) => {
    console.log('🔌 Initializing WebSocket for room:', roomId, 'user:', userId);
    currentRoomId = roomId;
    currentUserId = userId;
    eventHandlers = {};
    
    // Get auth token from localStorage (zustand persist)
    let token = null;
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      } catch (error) {
        console.error('❌ Error reading auth token:', error);
      }
    }
    
    if (!token) {
      console.error('❌ No auth token found');
      throw new Error('Authentication required');
    }
    
    console.log('🔑 Using auth token for WebSocket connection');
    
    return new Promise((resolve, reject) => {
      // If already connected and authenticated, resolve immediately
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket already connected');
        resolve({
          roomId,
          userId,
          connected: true,
        });
        return;
      }
      
      // Create new WebSocket connection
      console.log('🔌 Creating new WebSocket connection to:', WS_URL);
      ws = new WebSocket(WS_URL);
      
      let authResolved = false;
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected, sending authentication...');
        reconnectAttempts = 0;
        
        // Send authentication using safeSend
        safeSend({
          type: 'auth',
          token
        });
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (!authResolved) {
          reject(new Error('WebSocket connection failed'));
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        
        // Auto-reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(() => {
            if (currentRoomId && currentUserId) {
              ablySignaling.init(currentRoomId, currentUserId);
            }
          }, 2000 * reconnectAttempts);
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, ...payload } = data;
          
          console.log('📨 WebSocket received:', type, payload);
          
          // Handle authentication response
          if (type === 'authenticated' && !authResolved) {
            authResolved = true;
            console.log('✅ Authentication successful');
            resolve({
              roomId,
              userId,
              connected: true,
            });
          }
          
          // Trigger event handlers
          if (eventHandlers[type]) {
            console.log('✅ Triggering handler for:', type);
            eventHandlers[type](payload);
          } else if (type !== 'authenticated') {
            console.warn('⚠️ No handler registered for:', type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
    });
  },

  // Join a room
  joinRoom: async (userName) => {
    console.log('🚪 Joining room:', currentRoomId, 'as:', userName);
    currentUserName = userName;
    
    // Wait for WebSocket to be ready
    if (!ws) {
      console.error('❌ WebSocket not initialized');
      throw new Error('WebSocket not initialized');
    }
    
    // Wait for connection if connecting
    if (ws.readyState === WebSocket.CONNECTING) {
      console.log('⏳ Waiting for WebSocket connection...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        ws.addEventListener('open', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }
    
    if (ws.readyState === WebSocket.OPEN) {
      const joinMessage = {
        type: 'join-room',
        roomId: currentRoomId,
        userId: currentUserId,
        username: userName
      };
      console.log('📤 Sending join-room:', joinMessage);
      await safeSend(joinMessage);
      
      console.log('✅ Sent join-room event');
    } else {
      console.error('❌ WebSocket not connected, state:', ws.readyState);
      throw new Error('WebSocket not connected');
    }
    
    return {
      success: true,
      roomId: currentRoomId,
      participants: [],
    };
  },

  // Send WebRTC offer
  sendOffer: async (roomId, offer, targetUserId) => {
    console.log('📤 Sending offer to room:', roomId, 'target:', targetUserId);
    await safeSend({
      type: 'offer',
      roomId,
      from: currentUserId,
      to: targetUserId,
      offer
    });
    return { success: true };
  },

  // Send WebRTC answer
  sendAnswer: async (roomId, answer, targetUserId) => {
    console.log('📤 Sending answer to room:', roomId, 'target:', targetUserId);
    await safeSend({
      type: 'answer',
      roomId,
      from: currentUserId,
      to: targetUserId,
      answer
    });
    return { success: true };
  },

  // Send ICE candidate
  sendIceCandidate: async (roomId, candidate, targetUserId) => {
    console.log('📤 Sending ICE candidate to room:', roomId, 'target:', targetUserId);
    await safeSend({
      type: 'ice-candidate',
      roomId,
      from: currentUserId,
      to: targetUserId,
      candidate
    });
    return { success: true };
  },

  // Send chat message
  sendChatMessage: async (roomId, message) => {
    console.log('💬 Sending chat message to room:', roomId, message);
    await safeSend({
      type: 'chat-message',
      roomId,
      ...message
    });
    return { success: true };
  },

  // Send media state change
  sendMediaState: async (roomId, mediaState) => {
    console.log('🎥 Sending media state:', mediaState);
    await safeSend({
      type: 'media-state-changed',
      roomId,
      ...mediaState
    });
    return { success: true };
  },

  // Event listener registration
  on: (event, callback) => {
    console.log('👂 Registering listener for:', event);
    eventHandlers[event] = callback;
  },

  // Emit event (for testing/demo)
  emit: (event, data) => {
    if (eventHandlers[event]) {
      eventHandlers[event](data);
    }
  },

  // Leave room
  leaveRoom: async () => {
    console.log('🚪 Leaving room:', currentRoomId);
    await safeSend({
      type: 'leave-room',
      roomId: currentRoomId,
      userId: currentUserId
    });
    return { success: true };
  },

  // Disconnect
  disconnect: () => {
    console.log('🔌 Disconnecting WebSocket');
    if (ws) {
      ws.close();
      ws = null;
    }
    currentRoomId = null;
    currentUserId = null;
    currentUserName = null;
    eventHandlers = {};
  },
};

export default ablySignaling;
