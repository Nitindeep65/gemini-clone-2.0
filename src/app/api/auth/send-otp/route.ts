import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: Request) {
  try {
    const { phoneOrEmail } = await req.json()
    
    if (!phoneOrEmail) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: phoneOrEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          redirect_to: '/dashboard'
        }
      },
    })

    if (error) {
      console.error('Supabase magic link error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Check your email for the login link!' })
  } catch (error) {
    console.error('Send magic link error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
