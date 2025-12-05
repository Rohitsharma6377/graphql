import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Set user and token
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        error: null
      }),

      // Update user data
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      // Logout
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      }),

      // Set loading
      setLoading: (loading) => set({ loading }),

      // Set error
      setError: (error) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),

      // API Actions
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.register(userData);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.login(credentials);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      logoutUser: async () => {
        set({ loading: true });
        try {
          await apiClient.auth.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        }
      },

      fetchUser: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.getMe();
          set({
            user: response.data,
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

      updateProfile: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.updateProfile(userData);
          set({
            user: response.data,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to update profile'
          });
          throw error;
        }
      },

      changePassword: async (passwords) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.updatePassword(passwords);
          set({
            token: response.data.token,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to change password'
          });
          throw error;
        }
      },

      updateSettings: async (settings) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.auth.updateSettings(settings);
          set({
            user: response.data,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to update settings'
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
