import { create } from 'zustand'

// Video room store
export const useVideoStore = create((set) => ({
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  activePanel: null, // 'chat', 'whiteboard', 'document'
  participants: [],
  
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setParticipants: (participants) => set({ participants }),
}))

// Chat store
export const useChatStore = create((set) => ({
  messages: [],
  typingUsers: [],
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages) => set({ messages }),
  setTypingUsers: (users) => set({ typingUsers: users }),
}))

// Whiteboard store
export const useWhiteboardStore = create((set) => ({
  tool: 'pen',
  color: '#6366F1',
  lineWidth: 3,
  strokes: [],
  
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setLineWidth: (width) => set({ lineWidth: width }),
  addStroke: (stroke) => set((state) => ({
    strokes: [...state.strokes, stroke]
  })),
  setStrokes: (strokes) => set({ strokes }),
  clearStrokes: () => set({ strokes: [] }),
  undo: () => set((state) => ({
    strokes: state.strokes.slice(0, -1)
  })),
}))

// Document editor store
export const useDocumentStore = create((set) => ({
  content: '',
  collaborators: [],
  
  setContent: (content) => set({ content }),
  setCollaborators: (collaborators) => set({ collaborators }),
}))

// UI store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))

// User store
export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
