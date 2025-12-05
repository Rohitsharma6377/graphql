import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // Messages
  messages: [],
  
  // Chat state
  isOpen: false,
  unreadCount: 0,
  
  // Typing state
  typingUsers: [],
  
  // Add message
  addMessage: (message) => set((state) => {
    const newMessages = [...state.messages, {
      ...message,
      id: message.id || Date.now().toString(),
      timestamp: message.timestamp || new Date().toISOString(),
    }];
    
    return {
      messages: newMessages,
      unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + 1,
    };
  }),
  
  // Add system message
  addSystemMessage: (text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      type: 'system',
      text,
      timestamp: new Date().toISOString(),
    }],
  })),
  
  // Send message
  sendMessage: (text, socket, roomId) => {
    if (!text.trim() || !socket || !roomId) return;
    
    const message = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      type: 'user',
    };
    
    // Emit to socket
    socket.emit('chat-message', {
      roomId,
      message: text.trim(),
    });
    
    // Add to local state
    get().addMessage(message);
  },
  
  // Load messages
  loadMessages: async (roomId) => {
    // In production, fetch from API
    // const response = await fetch(`/api/rooms/${roomId}/messages`)
    // const data = await response.json()
    // set({ messages: data.messages || [] })
    
    // For now, just clear messages for new room
    set({ messages: [] });
    console.log('📝 Loaded messages for room:', roomId);
  },
  
  // Clear messages
  clearMessages: () => set({ messages: [] }),
  
  // Toggle chat
  toggleChat: () => set((state) => ({
    isOpen: !state.isOpen,
    unreadCount: state.isOpen ? state.unreadCount : 0,
  })),
  
  // Open chat
  openChat: () => set({ isOpen: true, unreadCount: 0 }),
  
  // Close chat
  closeChat: () => set({ isOpen: false }),
  
  // Set typing
  setTyping: (userId, isTyping) => set((state) => {
    if (isTyping) {
      return {
        typingUsers: [...new Set([...state.typingUsers, userId])],
      };
    } else {
      return {
        typingUsers: state.typingUsers.filter(id => id !== userId),
      };
    }
  }),
  
  // Clear typing
  clearTyping: () => set({ typingUsers: [] }),
}));
