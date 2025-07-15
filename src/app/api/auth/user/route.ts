import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-token')
    const userCookie = cookieStore.get('sb-user')

    if (!token && !userCookie) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }

    // If we have user data in cookies, return it
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value)
        return NextResponse.json({ user })
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }

    // Otherwise, verify the token with Supabase
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token.value)
      
      if (error || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'No valid authentication' }, { status: 401 })
  } catch (error) {
    console.error('User endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
