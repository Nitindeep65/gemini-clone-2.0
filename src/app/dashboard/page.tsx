'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/state/authStore'

interface Room {
  _id: string
  title: string
  created_at?: string
  updated_at?: string
}

export default function Dashboard() {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const { data: rooms = [], mutate } = useSWR('/api/chatroom')
  const { isAuthenticated, user, logout, login } = useAuthStore()

  // Check authentication and load user data from cookie
  useEffect(() => {
    const checkAuth = async () => {
      // First check if user data is in cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const userCookie = getCookie('sb-user');
      if (userCookie && !isAuthenticated) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          login(userData);
          return;
        } catch (error) {
          console.error('Error parsing user cookie:', error);
        }
      }

      if (!isAuthenticated) {
        // Try to get user data from server if we have a token
        try {
          const response = await fetch('/api/auth/user')
          if (response.ok) {
            const userData = await response.json()
            login(userData.user)
          } else {
            router.push('/login')
          }
        } catch {
          router.push('/login')
        }
      }
    }

    checkAuth()
  }, [isAuthenticated, router]) // eslint-disable-line react-hooks/exhaustive-deps

  async function createChatroom() {
    if (!title.trim()) return
    
    await fetch('/api/chatroom', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }) 
    })
    mutate()
    setTitle('')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => router.push('/chatroom/gemini-main')} 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="text-xl font-semibold">Gemini 1.5 Pro</h3>
              <p className="text-blue-100">AI Assistant & Search</p>
            </div>
          </div>
          <p className="text-sm text-blue-100">
            Chat with Google&apos;s latest AI model or search for anything
          </p>
        </div>

        <div 
          onClick={() => router.push('/chatroom/search-history')} 
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">📚</div>
            <div>
              <h3 className="text-xl font-semibold">Search History</h3>
              <p className="text-green-100">View Past Searches</p>
            </div>
          </div>
          <p className="text-sm text-green-100">
            Access your search history and previous conversations
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-xl font-semibold">Quick Stats</h3>
              <p className="text-orange-100">Your Activity</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p>Chatrooms: {rooms.length}</p>
            <p>Active Today: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Chatroom Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Chatrooms</h2>
        
        <div className="mb-6 flex gap-3">
          <input 
            className="border-2 border-gray-200 p-3 flex-1 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Enter chatroom title"
            onKeyPress={e => e.key === 'Enter' && createChatroom()}
          />
          <button 
            className="bg-blue-500 px-6 py-3 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium" 
            onClick={createChatroom}
            disabled={!title.trim()}
          >
            Create Room
          </button>
        </div>
        
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No chatrooms yet</h3>
            <p className="text-gray-500">Create your first chatroom to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room: Room) => (
              <div 
                key={room._id} 
                onClick={() => router.push(`/chatroom/${room._id}`)} 
                className="cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💬</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {room.title}
                    </div>
                    {room.created_at && (
                      <div className="text-sm text-gray-500">
                        Created: {new Date(room.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}