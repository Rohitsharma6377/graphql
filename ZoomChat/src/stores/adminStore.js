import { create } from 'zustand';
import apiClient from '../lib/api';

export const useAdminStore = create((set, get) => ({
  // Statistics
  stats: null,
  users: [],
  rooms: [],
  logs: [],
  selectedUser: null,
  selectedRoom: null,
  
  // Pagination
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  roomsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  logsPagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  },

  // UI State
  loading: false,
  error: null,

  // Setters
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // API Actions - Statistics
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.getStats();
      set({
        stats: response.data,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch statistics'
      });
      throw error;
    }
  },

  // API Actions - Users
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.getUsers(params);
      set({
        users: response.data.users,
        usersPagination: response.data.pagination,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch users'
      });
      throw error;
    }
  },

  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.getUser(userId);
      set({
        selectedUser: response.data,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch user'
      });
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.updateUserRole(userId, role);
      set((state) => ({
        users: state.users.map(u => 
          u._id === userId ? { ...u, role } : u
        ),
        selectedUser: state.selectedUser?._id === userId 
          ? { ...state.selectedUser, role } 
          : state.selectedUser,
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update user role'
      });
      throw error;
    }
  },

  updateUserAccountType: async (userId, accountType) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.updateAccountType(userId, accountType);
      set((state) => ({
        users: state.users.map(u => 
          u._id === userId ? { ...u, accountType } : u
        ),
        selectedUser: state.selectedUser?._id === userId 
          ? { ...state.selectedUser, accountType } 
          : state.selectedUser,
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update account type'
      });
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.updateUserStatus(userId, status);
      set((state) => ({
        users: state.users.map(u => 
          u._id === userId ? { ...u, status } : u
        ),
        selectedUser: state.selectedUser?._id === userId 
          ? { ...state.selectedUser, status } 
          : state.selectedUser,
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update user status'
      });
      throw error;
    }
  },

  banUser: async (userId) => {
    return get().updateUserStatus(userId, 'banned');
  },

  unbanUser: async (userId) => {
    return get().updateUserStatus(userId, 'active');
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.admin.deleteUser(userId);
      set((state) => ({
        users: state.users.filter(u => u._id !== userId),
        selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
        loading: false,
        error: null
      }));
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to delete user'
      });
      throw error;
    }
  },

  // API Actions - Rooms
  fetchRooms: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.getRooms(params);
      set({
        rooms: response.data.rooms,
        roomsPagination: response.data.pagination,
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

  deleteRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.admin.deleteRoom(roomId);
      set((state) => ({
        rooms: state.rooms.filter(r => r._id !== roomId),
        selectedRoom: state.selectedRoom?._id === roomId ? null : state.selectedRoom,
        loading: false,
        error: null
      }));
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to delete room'
      });
      throw error;
    }
  },

  // API Actions - Logs
  fetchLogs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.admin.getLogs(params);
      set({
        logs: response.data.sessions,
        logsPagination: response.data.pagination,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch logs'
      });
      throw error;
    }
  },

  // Clear selected items
  clearSelectedUser: () => set({ selectedUser: null }),
  clearSelectedRoom: () => set({ selectedRoom: null }),

  // Reset store
  reset: () => set({
    stats: null,
    users: [],
    rooms: [],
    logs: [],
    selectedUser: null,
    selectedRoom: null,
    loading: false,
    error: null
  })
}));
