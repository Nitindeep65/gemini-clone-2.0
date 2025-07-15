import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token, token_type, expires_at, type } = await request.json()

    console.log('Fragment callback - processing tokens:', {
      access_token: access_token ? 'present' : 'missing',
      refresh_token: refresh_token ? 'present' : 'missing',
      token_type,
      expires_at,
      type
    })

    if (!access_token || !refresh_token) {
      console.error('Missing required tokens')
      return NextResponse.json({ 
        success: false, 
        error: 'Missing access token or refresh token' 
      }, { status: 400 })
    }

    // Set the session using the tokens from the fragment
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Fragment session set error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    if (!data?.session || !data?.user) {
      console.error('No session or user data from fragment setSession')
      return NextResponse.json({ 
        success: false, 
        error: 'No session created' 
      }, { status: 400 })
    }

    console.log('Fragment session set success - user:', data.user.email)
    
    // Set cookies for the authenticated user
    const cookieStore = await cookies()
    cookieStore.set('sb-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookieStore.set('sb-user', JSON.stringify(data.user), {
      path: '/',
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      session: data.session
    })

  } catch (error) {
    console.error('Fragment callback error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
