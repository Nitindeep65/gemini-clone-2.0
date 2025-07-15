'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChatStore } from '@/state/chatStore'

export default function ChatroomPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [isSearch, setIsSearch] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    searchHistory,
    isLoading,
    isThinking,
    addMessage,
    setLoading,
    setThinking,
    addSearchHistory,
    setCurrentChatRoom,
    createChatRoom,
    getCurrentMessages,
    getCurrentSearchHistory
  } = useChatStore()

  useEffect(() => {
    if (id) {
      const chatRoomId = Array.isArray(id) ? id[0] : id
      setCurrentChatRoom(chatRoomId)
      
      // Create chat room if it doesn't exist
      if (!getCurrentMessages().length) {
        createChatRoom(`Chat Room ${chatRoomId}`)
      }
      
      // Check for query parameter to pre-fill input
      const query = searchParams.get('query')
      if (query) {
        setInput(query)
        setIsSearch(true)
      }
    }
  }, [id, setCurrentChatRoom, createChatRoom, getCurrentMessages, searchParams])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    addMessage({
      text: userMessage,
      role: 'user',
      timestamp: new Date()
    })
    
    // Start thinking animation
    setThinking(true)
    setLoading(true)
    
    try {
      const response = await fetch(`/api/chatroom/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: getCurrentMessages(),
          userMessage,
          isSearch,
          searchHistory: getCurrentSearchHistory().map(item => item.query)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Add AI response
        addMessage({
          text: data.reply,
          role: 'ai',
          timestamp: new Date()
        })
        
        // Add to search history if it was a search
        if (isSearch) {
          addSearchHistory(userMessage, data.reply)
        }
      } else {
        addMessage({
          text: 'Sorry, I encountered an error. Please try again.',
          role: 'ai',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        role: 'ai',
        timestamp: new Date()
      })
    } finally {
      setThinking(false)
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    useChatStore.getState().clearMessages()
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Gemini Pro Chat
            </h1>
            <p className="text-sm text-gray-600">
              Chat Room {id} • {isSearch ? 'Search Mode' : 'Chat Mode'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearch(!isSearch)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSearch 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {isSearch ? '🔍 Search Mode' : '💬 Chat Mode'}
            </button>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome to Gemini 1.5 Pro Chat
            </h2>
            <p className="text-gray-600">
              Start a conversation or switch to search mode to find information
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm border'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {msg.text}
              </div>
              <div className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">
                  Gemini is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Search History Sidebar (when in search mode) */}
      {isSearch && searchHistory.length > 0 && (
        <div className="bg-white border-t px-6 py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h3>
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            {getCurrentSearchHistory().slice(-5).map((item) => (
              <button
                key={item.id}
                onClick={() => setInput(item.query)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
              >
                {item.query.length > 30 ? `${item.query.substring(0, 30)}...` : item.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={isSearch ? "Search anything..." : "Type your message..."}
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '50px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-3 rounded-2xl text-white font-medium transition-all ${
              !input.trim() || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : isSearch
                ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <span>{isSearch ? '🔍 Search' : '📤 Send'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
