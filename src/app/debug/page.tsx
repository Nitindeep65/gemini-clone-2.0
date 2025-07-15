'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DebugContent() {
  const searchParams = useSearchParams()
  const [allParams, setAllParams] = useState<Record<string, string>>({})
  const [fragment, setFragment] = useState<string>('')

  useEffect(() => {
    // Get all URL parameters
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setAllParams(params)

    // Get fragment parameters
    const hash = window.location.hash
    if (hash) {
      setFragment(hash)
    }
  }, [searchParams])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Magic Link Parameters</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Full URL:</h2>
        <p className="bg-gray-100 p-2 rounded text-sm break-all">
          {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">URL Parameters:</h2>
        <div className="bg-gray-100 p-2 rounded">
          {Object.keys(allParams).length > 0 ? (
            <pre className="text-sm">{JSON.stringify(allParams, null, 2)}</pre>
          ) : (
            <p className="text-gray-500">No parameters found</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Fragment (Hash):</h2>
        <div className="bg-gray-100 p-2 rounded">
          {fragment ? (
            <p className="text-sm">{fragment}</p>
          ) : (
            <p className="text-gray-500">No fragment found</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Expected Parameters:</h2>
        <ul className="list-disc pl-6 text-sm">
          <li><code>access_token</code> - Direct token from Supabase</li>
          <li><code>refresh_token</code> - Refresh token from Supabase</li>
          <li><code>token_hash</code> - Hash token for OTP verification</li>
          <li><code>type</code> - Authentication type (usually &quot;email&quot;)</li>
          <li><code>code</code> - Authorization code</li>
        </ul>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => window.location.href = '/auth/callback' + window.location.search + window.location.hash}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Authentication Callback
        </button>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div>Loading debug information...</div>}>
      <DebugContent />
    </Suspense>
  )
}
