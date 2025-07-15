'use client'
import { useChatStore } from '@/state/chatStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchHistoryPage() {
  const router = useRouter()
  const { searchHistory, clearSearchHistory } = useChatStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHistory = searchHistory.filter(item =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      clearSearchHistory()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Search History</h1>
                <p className="text-gray-600">View and manage your search queries</p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter search history..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Search History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {searchHistory.length === 0 ? 'No Search History' : 'No Results Found'}
              </h2>
              <p className="text-gray-600">
                {searchHistory.length === 0 
                  ? 'Start searching to see your history here'
                  : 'Try adjusting your search filter'
                }
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-blue-600 font-medium">🔍 Query:</div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-gray-800">{item.query}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-green-600 font-medium mb-2">🤖 Gemini Response:</div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {item.response}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => router.push(`/chatroom/gemini-main?query=${encodeURIComponent(item.query)}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Search Again →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{searchHistory.length}</div>
                <div className="text-sm text-gray-600">Total Searches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {searchHistory.filter(item => 
                    Date.now() - new Date(item.timestamp).getTime() < 24 * 60 * 60 * 1000
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {searchHistory.filter(item => 
                    Date.now() - new Date(item.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
                  ).length}
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
