import { create } from 'zustand';

export const useCallStore = create((set, get) => ({
  // Local media
  localStream: null,
  localAudioTrack: null,
  localVideoTrack: null,
  screenStream: null,

  // Media states
  isAudioOn: false,
  isVideoOn: false,
  isScreenSharing: false,
  isCameraOn: false,
  isMicOn: false,

  // Peer connections
  peerConnections: {},

  // Remote streams
  remoteStreams: {},

  // Participants
  participants: [],

  // Call state
  isInCall: false,
  callQuality: 'good',
  callDuration: 0,
  status: 'idle', // idle, connecting, connected, disconnected

  // Set local stream
  setLocalStream: (stream) => set({ localStream: stream }),

  // Set remote stream
  setRemoteStream: (userId, stream) => set((state) => ({
    remoteStreams: {
      ...state.remoteStreams,
      [userId]: stream
    }
  })),

  // Set local audio track
  setLocalAudioTrack: (track) => set({ localAudioTrack: track }),

  // Set local video track
  setLocalVideoTrack: (track) => set({ localVideoTrack: track }),

  // Set screen stream
  setScreenStream: (stream) => set({ screenStream: stream }),

  // Join call
  joinCall: async (roomId, userId, userName) => {
    set({ 
      isInCall: true, 
      status: 'connecting',
    });
    console.log('📞 Joining call:', roomId, userId, userName);
    
    // Request media permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      set({
        localStream: stream,
        localVideoTrack: videoTrack,
        localAudioTrack: audioTrack,
        isCameraOn: true,
        isMicOn: true,
        isVideoOn: true,
        isAudioOn: true,
        status: 'connected',
      });
      
      console.log('✅ Media acquired successfully');
    } catch (error) {
      console.error('❌ Failed to get media:', error);
      console.log('⚠️ Creating dummy stream for peer connection compatibility');
      
      try {
        // Create a canvas-based dummy video stream
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Camera Off', canvas.width / 2, canvas.height / 2);
        }
        
        // Get stream from canvas at 30fps
        const dummyVideoStream = canvas.captureStream(30);
        const videoTrack = dummyVideoStream.getVideoTracks()[0];
        
        // Create silent audio track
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.frequency.value = 0; // Silent
        const audioTrack = destination.stream.getAudioTracks()[0];
        
        // Combine tracks
        const dummyStream = new MediaStream([videoTrack, audioTrack]);
        
        set({
          localStream: dummyStream,
          localVideoTrack: videoTrack,
          localAudioTrack: audioTrack,
          isCameraOn: false,
          isMicOn: false,
          isVideoOn: false,
          isAudioOn: false,
          status: 'connected',
        });
        
        console.log('✅ Dummy stream created for peer connection');
      } catch (dummyError) {
        console.error('❌ Failed to create dummy stream:', dummyError);
        
        // Absolute fallback - no stream at all
        set({ 
          status: 'connected',
          isCameraOn: false,
          isMicOn: false,
          isVideoOn: false,
          isAudioOn: false
        });
      }
      
      // Don't throw - allow joining in view-only mode
    }
  },

  // Leave call
  leaveCall: () => {
    const state = get();
    
    // Stop all tracks
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    Object.values(state.peerConnections).forEach(pc => {
      if (pc && typeof pc.close === 'function') {
        pc.close();
      }
    });

    set({
      isInCall: false,
      status: 'idle',
      participants: [],
      peerConnections: {},
      remoteStreams: {},
    });
  },

  // Toggle camera
  toggleCamera: () => set((state) => {
    if (state.localVideoTrack) {
      state.localVideoTrack.enabled = !state.isCameraOn;
    }
    return { isCameraOn: !state.isCameraOn, isVideoOn: !state.isCameraOn };
  }),

  // Toggle mic
  toggleMic: () => set((state) => {
    if (state.localAudioTrack) {
      state.localAudioTrack.enabled = !state.isMicOn;
    }
    return { isMicOn: !state.isMicOn, isAudioOn: !state.isMicOn };
  }),

  // Toggle audio (alias for toggleMic)
  toggleAudio: () => get().toggleMic(),

  // Toggle video (alias for toggleCamera)
  toggleVideo: () => get().toggleCamera(),

  // Start screen share
  startScreenShare: async () => {
    try {
      console.log('🖥️ Requesting screen share with audio...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      console.log('✅ Screen stream obtained')
      console.log('Video tracks:', screenStream.getVideoTracks().length)
      console.log('Audio tracks:', screenStream.getAudioTracks().length)
      
      // Log track details
      screenStream.getTracks().forEach(track => {
        console.log(`  - ${track.kind} track: ${track.label}`)
      })
      
      set({ 
        screenStream, 
        isScreenSharing: true 
      });
      
      return screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      throw error;
    }
  },

  // Stop screen share
  stopScreenShare: () => {
    const state = get();
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(track => track.stop());
    }
    set({ 
      screenStream: null, 
      isScreenSharing: false 
    });
  },

  // Set screen sharing
  setScreenSharing: (isSharing) => set({ isScreenSharing: isSharing }),

  // Add participant
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),

  // Remove participant
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId)
  })),

  // Update participant
  updateParticipant: (userId, updates) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === userId ? { ...p, ...updates } : p
    )
  })),

  // Increment call duration
  incrementCallDuration: () => set((state) => ({
    callDuration: state.callDuration + 1
  })),

  // Add peer connection
  addPeerConnection: (userId, pc) => set((state) => ({
    peerConnections: {
      ...state.peerConnections,
      [userId]: pc
    }
  })),

  // Remove peer connection
  removePeerConnection: (userId) => set((state) => {
    const { [userId]: removed, ...rest } = state.peerConnections;
    return { peerConnections: rest };
  }),

  // Add remote stream
  addRemoteStream: (userId, stream) => set((state) => ({
    remoteStreams: {
      ...state.remoteStreams,
      [userId]: stream
    }
  })),

  // Remove remote stream
  removeRemoteStream: (userId) => set((state) => {
    const { [userId]: removed, ...rest } = state.remoteStreams;
    return { remoteStreams: rest };
  }),

  // Set in call
  setInCall: (isInCall) => set({ isInCall }),

  // Set status
  setStatus: (status) => set({ status }),

  // Set call quality
  setCallQuality: (quality) => set({ callQuality: quality }),

  // Cleanup
  cleanup: () => {
    const state = get();
    
    // Stop all tracks
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    Object.values(state.peerConnections).forEach(pc => {
      if (pc && typeof pc.close === 'function') {
        pc.close();
      }
    });

    set({
      localStream: null,
      localAudioTrack: null,
      localVideoTrack: null,
      screenStream: null,
      isAudioOn: false,
      isVideoOn: false,
      isCameraOn: false,
      isMicOn: false,
      isScreenSharing: false,
      peerConnections: {},
      remoteStreams: {},
      participants: [],
      isInCall: false,
      callDuration: 0,
      status: 'idle',
    });
  }
}));
