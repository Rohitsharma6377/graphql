import io from 'socket.io-client';
import { useAuthStore, useRoomStore, useCallStore } from '@/stores';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupListeners();
    return this.socket;
  }

  setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Room events
    this.socket.on('room-joined', (data) => {
      console.log('Joined room:', data.roomId);
      useRoomStore.getState().setParticipants(data.participants);
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data.user.name);
      useRoomStore.getState().addParticipant({
        userId: data.userId,
        user: data.user,
        socketId: data.socketId
      });
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data.userId);
      useRoomStore.getState().removeParticipant(data.userId);
      useCallStore.getState().removeRemoteStream(data.userId);
      useCallStore.getState().removePeerConnection(data.userId);
    });

    // WebRTC signaling
    this.socket.on('offer', async (data) => {
      // Handle in your WebRTC component
      window.dispatchEvent(new CustomEvent('rtc-offer', { detail: data }));
    });

    this.socket.on('answer', async (data) => {
      window.dispatchEvent(new CustomEvent('rtc-answer', { detail: data }));
    });

    this.socket.on('ice-candidate', async (data) => {
      window.dispatchEvent(new CustomEvent('rtc-ice-candidate', { detail: data }));
    });

    // Chat events
    this.socket.on('chat-message', (message) => {
      useRoomStore.getState().addMessage(message);
    });

    // Media toggle events
    this.socket.on('user-audio-toggled', (data) => {
      useRoomStore.getState().updateParticipant(data.userId, {
        isAudioOn: data.isAudioOn
      });
    });

    this.socket.on('user-video-toggled', (data) => {
      useRoomStore.getState().updateParticipant(data.userId, {
        isVideoOn: data.isVideoOn
      });
    });

    this.socket.on('user-screen-share-toggled', (data) => {
      useRoomStore.getState().updateParticipant(data.userId, {
        isScreenSharing: data.isScreenSharing
      });
    });

    // Emoji events
    this.socket.on('emoji-received', (data) => {
      window.dispatchEvent(new CustomEvent('emoji-received', { detail: data }));
    });

    // Whiteboard events
    this.socket.on('whiteboard-draw', (data) => {
      window.dispatchEvent(new CustomEvent('whiteboard-draw', { detail: data }));
    });

    this.socket.on('whiteboard-clear', () => {
      window.dispatchEvent(new CustomEvent('whiteboard-clear'));
    });

    // Kick/Mute events
    this.socket.on('kicked-from-room', (data) => {
      alert('You have been removed from the room');
      window.location.href = '/';
    });

    this.socket.on('force-muted', (data) => {
      const callStore = useCallStore.getState();
      if (callStore.isAudioOn) {
        callStore.toggleAudio();
      }
    });
  }

  // Room methods
  joinRoom(roomId) {
    this.socket?.emit('join-room', { roomId });
  }

  leaveRoom(roomId) {
    this.socket?.emit('leave-room', { roomId });
  }

  // WebRTC methods
  sendOffer(to, offer, roomId) {
    this.socket?.emit('offer', { to, offer, roomId });
  }

  sendAnswer(to, answer, roomId) {
    this.socket?.emit('answer', { to, answer, roomId });
  }

  sendIceCandidate(to, candidate, roomId) {
    this.socket?.emit('ice-candidate', { to, candidate, roomId });
  }

  // Chat methods
  sendMessage(roomId, content, type = 'text', isPrivate = false, recipientId = null) {
    this.socket?.emit('chat-message', {
      roomId,
      content,
      type,
      isPrivate,
      recipientId
    });
  }

  // Media toggle methods
  toggleAudio(roomId, isAudioOn) {
    this.socket?.emit('toggle-audio', { roomId, isAudioOn });
  }

  toggleVideo(roomId, isVideoOn) {
    this.socket?.emit('toggle-video', { roomId, isVideoOn });
  }

  toggleScreenShare(roomId, isScreenSharing) {
    this.socket?.emit('toggle-screen-share', { roomId, isScreenSharing });
  }

  // Emoji method
  sendEmoji(roomId, emoji) {
    this.socket?.emit('send-emoji', { roomId, emoji });
  }

  // Whiteboard methods
  sendWhiteboardDraw(roomId, drawData) {
    this.socket?.emit('whiteboard-draw', { roomId, drawData });
  }

  clearWhiteboard(roomId) {
    this.socket?.emit('whiteboard-clear', { roomId });
  }

  // Admin methods
  kickParticipant(roomId, userId) {
    this.socket?.emit('kick-participant', { roomId, userId });
  }

  muteParticipant(roomId, userId) {
    this.socket?.emit('mute-participant', { roomId, userId });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
