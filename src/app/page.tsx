// /app/page.tsx
'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/state/authStore'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Gemini Chat App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Experience real-time conversations with AI using Gemini API. Login via OTP and start chatting with intelligent responses, image sharing, and more.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Login with OTP
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-300 hover:border-gray-500 px-6 py-3 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
