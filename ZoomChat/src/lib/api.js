import { useAuthStore } from '@/stores';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = `${API_URL}/api`;
  }

  async request(endpoint, options = {}) {
    const { token } = useAuthStore.getState();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    register: (userData) => 
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

    login: (credentials) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    logout: () =>
      this.request('/auth/logout', { method: 'POST' }),

    getMe: () =>
      this.request('/auth/me'),

    updateProfile: (userData) =>
      this.request('/auth/update', {
        method: 'PUT',
        body: JSON.stringify(userData)
      }),

    updatePassword: (passwords) =>
      this.request('/auth/update-password', {
        method: 'PUT',
        body: JSON.stringify(passwords)
      }),

    updateSettings: (settings) =>
      this.request('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings })
      })
  };

  // Room endpoints
  rooms = {
    create: (roomData) =>
      this.request('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData)
      }),

    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/rooms${query ? `?${query}` : ''}`);
    },

    getById: (roomId) =>
      this.request(`/rooms/${roomId}`),

    join: (roomId, password) =>
      this.request(`/rooms/${roomId}/join`, {
        method: 'POST',
        body: JSON.stringify({ password })
      }),

    leave: (roomId) =>
      this.request(`/rooms/${roomId}/leave`, { method: 'POST' }),

    updateSettings: (roomId, settings) =>
      this.request(`/rooms/${roomId}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ settings })
      }),

    end: (roomId) =>
      this.request(`/rooms/${roomId}/end`, { method: 'POST' }),

    getMessages: (roomId, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/rooms/${roomId}/messages${query ? `?${query}` : ''}`);
    },

    updateParticipantMedia: (roomId, userId, mediaState) =>
      this.request(`/rooms/${roomId}/participants/${userId}/media`, {
        method: 'PUT',
        body: JSON.stringify(mediaState)
      })
  };

  // Admin endpoints
  admin = {
    getStats: () =>
      this.request('/admin/stats'),

    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/users${query ? `?${query}` : ''}`);
    },

    getUser: (userId) =>
      this.request(`/admin/users/${userId}`),

    updateUserRole: (userId, role) =>
      this.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      }),

    updateAccountType: (userId, accountType) =>
      this.request(`/admin/users/${userId}/account-type`, {
        method: 'PUT',
        body: JSON.stringify({ accountType })
      }),

    updateUserStatus: (userId, status) =>
      this.request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }),

    deleteUser: (userId) =>
      this.request(`/admin/users/${userId}`, { method: 'DELETE' }),

    getRooms: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/rooms${query ? `?${query}` : ''}`);
    },

    deleteRoom: (roomId) =>
      this.request(`/admin/rooms/${roomId}`, { method: 'DELETE' }),

    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/logs${query ? `?${query}` : ''}`);
    }
  };
}

const apiClient = new ApiClient();

export default apiClient;
