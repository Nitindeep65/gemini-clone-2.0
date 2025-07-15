'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/state/authStore'

const formSchema = z.object({
  email: z.string().email()
})

type FormData = z.infer<typeof formSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }

    // Check for error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [isAuthenticated, router])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneOrEmail: data.email })
      })
      const result = await res.json()

      if (result.success) {
        // Show success message instead of redirecting
        setError('')
        alert('Check your email for the login link!')
      } else {
        setError(result.error || 'Failed to send login link')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md p-6 border rounded">
        <h1 className="text-2xl font-bold">Login via Magic Link</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a secure login link.
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded text-black"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending Login Link...' : 'Send Login Link'}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Check your email (including spam folder) for the login link after clicking the button.
        </p>
      </form>
    </main>
  )
}
