import { create } from 'zustand';
import apiClient from '../lib/api';

export const useRoomStore = create((set, get) => ({
  currentRoom: null,
  rooms: [],
  participants: [],
  messages: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },

  // Set current room
  setCurrentRoom: (room) => set({ currentRoom: room }),

  // Set rooms list
  setRooms: (rooms) => set({ rooms }),

  // Add room
  addRoom: (room) => set((state) => ({
    rooms: [room, ...state.rooms]
  })),

  // Update room
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map(r => 
      r.roomId === roomId ? { ...r, ...updates } : r
    ),
    currentRoom: state.currentRoom?.roomId === roomId 
      ? { ...state.currentRoom, ...updates } 
      : state.currentRoom
  })),

  // Remove room
  removeRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(r => r.roomId !== roomId)
  })),

  // Set participants
  setParticipants: (participants) => set({ participants }),

  // Add participant
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),

  // Remove participant
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.userId !== userId)
  })),

  // Update participant
  updateParticipant: (userId, updates) => set((state) => ({
    participants: state.participants.map(p =>
      p.userId === userId ? { ...p, ...updates } : p
    )
  })),

  // Set messages
  setMessages: (messages) => set({ messages }),

  // Add message
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Clear messages
  clearMessages: () => set({ messages: [] }),

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Leave room
  leaveRoom: () => set({
    currentRoom: null,
    participants: [],
    messages: []
  }),

  // API Actions
  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.create(roomData);
      set((state) => ({
        rooms: [response.data, ...state.rooms],
        currentRoom: response.data,
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to create room'
      });
      throw error;
    }
  },

  fetchRooms: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.getAll(params);
      set({
        rooms: response.data.rooms,
        pagination: response.data.pagination,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch rooms'
      });
      throw error;
    }
  },

  fetchRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.getById(roomId);
      set({
        currentRoom: response.data,
        participants: response.data.participants || [],
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch room'
      });
      throw error;
    }
  },

  joinRoom: async (roomId, password) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.join(roomId, password);
      set({
        currentRoom: response.data,
        participants: response.data.participants || [],
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to join room'
      });
      throw error;
    }
  },

  leaveRoomAPI: async (roomId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.rooms.leave(roomId);
      set({
        currentRoom: null,
        participants: [],
        messages: [],
        loading: false,
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to leave room'
      });
      throw error;
    }
  },

  updateRoomSettings: async (roomId, settings) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.updateSettings(roomId, settings);
      set((state) => ({
        currentRoom: state.currentRoom?.roomId === roomId 
          ? response.data 
          : state.currentRoom,
        rooms: state.rooms.map(r => 
          r.roomId === roomId ? response.data : r
        ),
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update room settings'
      });
      throw error;
    }
  },

  endRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.end(roomId);
      set((state) => ({
        currentRoom: null,
        participants: [],
        rooms: state.rooms.map(r => 
          r.roomId === roomId ? { ...r, status: 'ended' } : r
        ),
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to end room'
      });
      throw error;
    }
  },

  fetchMessages: async (roomId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.rooms.getMessages(roomId, params);
      set({
        messages: response.data.messages,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch messages'
      });
      throw error;
    }
  },

  updateParticipantMedia: async (roomId, userId, mediaState) => {
    set({ loading: true, error: null });
    try {
      await apiClient.rooms.updateParticipantMedia(roomId, userId, mediaState);
      set((state) => ({
        participants: state.participants.map(p =>
          p.user._id === userId ? { ...p, ...mediaState } : p
        ),
        loading: false,
        error: null
      }));
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update participant media'
      });
      throw error;
    }
  }
}));
