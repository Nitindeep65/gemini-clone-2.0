import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  text: string
  role: 'user' | 'ai'
  timestamp: Date
  image?: string
}

interface ChatRoom {
  id: string
  name: string
  messages: Message[]
  lastActivity: Date
}

interface SearchHistoryItem {
  id: string
  query: string
  response: string
  timestamp: Date
}

interface ChatState {
  // Chat rooms
  chatRooms: ChatRoom[]
  currentChatRoom: string | null
  
  // Messages
  messages: Message[]
  
  // Search history
  searchHistory: SearchHistoryItem[]
  
  // UI state
  isLoading: boolean
  isThinking: boolean
  
  // Actions
  setCurrentChatRoom: (id: string) => void
  createChatRoom: (name: string) => string
  deleteChatRoom: (id: string) => void
  
  setMessages: (msgs: Message[]) => void
  addMessage: (msg: Omit<Message, 'id'>) => void
  clearMessages: () => void
  
  addSearchHistory: (query: string, response: string) => void
  clearSearchHistory: () => void
  
  setLoading: (loading: boolean) => void
  setThinking: (thinking: boolean) => void
  
  // Get messages for current chat room
  getCurrentMessages: () => Message[]
  
  // Get search history for current chat room
  getCurrentSearchHistory: () => SearchHistoryItem[]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      chatRooms: [],
      currentChatRoom: null,
      messages: [],
      searchHistory: [],
      isLoading: false,
      isThinking: false,
      
      // Chat room actions
      setCurrentChatRoom: (id) => {
        const room = get().chatRooms.find(r => r.id === id)
        if (room) {
          set({ 
            currentChatRoom: id,
            messages: room.messages 
          })
        }
      },
      
      createChatRoom: (name) => {
        const id = Date.now().toString()
        const newRoom: ChatRoom = {
          id,
          name,
          messages: [],
          lastActivity: new Date()
        }
        set(state => ({
          chatRooms: [...state.chatRooms, newRoom],
          currentChatRoom: id,
          messages: []
        }))
        return id
      },
      
      deleteChatRoom: (id) => {
        set(state => ({
          chatRooms: state.chatRooms.filter(r => r.id !== id),
          currentChatRoom: state.currentChatRoom === id ? null : state.currentChatRoom,
          messages: state.currentChatRoom === id ? [] : state.messages
        }))
      },
      
      // Message actions
      setMessages: (msgs) => set({ messages: msgs }),
      
      addMessage: (msg) => {
        const newMessage: Message = {
          ...msg,
          id: Date.now().toString(),
          timestamp: new Date()
        }
        
        set(state => {
          const updatedMessages = [...state.messages, newMessage]
          
          // Update the current chat room
          if (state.currentChatRoom) {
            const updatedRooms = state.chatRooms.map(room => 
              room.id === state.currentChatRoom 
                ? { ...room, messages: updatedMessages, lastActivity: new Date() }
                : room
            )
            return {
              messages: updatedMessages,
              chatRooms: updatedRooms
            }
          }
          
          return { messages: updatedMessages }
        })
      },
      
      clearMessages: () => set({ messages: [] }),
      
      // Search history actions
      addSearchHistory: (query, response) => {
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          query,
          response,
          timestamp: new Date()
        }
        set(state => ({
          searchHistory: [...state.searchHistory, newItem]
        }))
      },
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setThinking: (thinking) => set({ isThinking: thinking }),
      
      // Getters
      getCurrentMessages: () => get().messages,
      getCurrentSearchHistory: () => get().searchHistory.filter(item => 
        // Filter search history for current session or recent items
        Date.now() - item.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      )
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chatRooms: state.chatRooms,
        searchHistory: state.searchHistory
      })
    }
  )
)