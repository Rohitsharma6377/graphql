import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // UI states
  isSidebarOpen: true,
  isChatOpen: true,
  isParticipantsOpen: false,
  isSettingsOpen: false,
  isWhiteboardOpen: false,

  // Notifications
  notifications: [],

  // Modal states
  activeModal: null,

  // Theme
  theme: 'light',

  // Layout
  layout: 'grid', // grid, speaker, gallery

  // Toggle sidebar
  toggleSidebar: () => set((state) => ({
    isSidebarOpen: !state.isSidebarOpen
  })),

  // Toggle chat
  toggleChat: () => set((state) => ({
    isChatOpen: !state.isChatOpen
  })),

  // Toggle participants
  toggleParticipants: () => set((state) => ({
    isParticipantsOpen: !state.isParticipantsOpen
  })),

  // Toggle settings
  toggleSettings: () => set((state) => ({
    isSettingsOpen: !state.isSettingsOpen
  })),

  // Toggle whiteboard
  toggleWhiteboard: () => set((state) => ({
    isWhiteboardOpen: !state.isWhiteboardOpen
  })),

  // Add notification
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      ...notification
    }]
  })),

  // Add toast (alias for addNotification)
  addToast: (toast) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      ...toast
    }]
  })),

  // Remove notification
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Clear all notifications
  clearNotifications: () => set({ notifications: [] }),

  // Set active modal
  setActiveModal: (modal) => set({ activeModal: modal }),

  // Close modal
  closeModal: () => set({ activeModal: null }),

  // Set theme
  setTheme: (theme) => set({ theme }),

  // Set layout
  setLayout: (layout) => set({ layout })
}));
