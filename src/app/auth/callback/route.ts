import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  
  // Handle different possible URL formats from Supabase
  const token_hash = searchParams.get('token_hash') || searchParams.get('token')
  const next = searchParams.get('next') || '/dashboard'
  const code = searchParams.get('code')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  console.log('Auth callback - Full URL:', request.url)
  console.log('Auth callback - Search params:', Object.fromEntries(searchParams.entries()))
  console.log('Auth callback - token_hash:', token_hash)
  console.log('Auth callback - access_token:', access_token ? 'present' : 'missing')
  console.log('Auth callback - code:', code)

  // Method 1: Handle direct access_token from URL query params
  if (access_token && refresh_token) {
    console.log('Method 1: Using access_token from query params')
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        console.error('Session set error:', error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (!data?.session || !data?.user) {
        console.error('No session or user data from setSession')
        return NextResponse.redirect(new URL('/login?error=No session created', request.url))
      }

      console.log('Session set success - user:', data.user.email)
      
      // Set cookies and redirect
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
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.redirect(new URL(next, request.url))
    } catch (error) {
      console.error('Session set error:', error)
      return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url))
    }
  }

  // Method 2: Handle the code flow
  if (code) {
    console.log('Method 2: Using authorization code')
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (!data?.session || !data?.user) {
        console.error('No session or user data from code exchange')
        return NextResponse.redirect(new URL('/login?error=No session created', request.url))
      }

      console.log('Code exchange success - user:', data.user.email)
      
      // Set cookies and redirect
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
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.redirect(new URL(next, request.url))
    } catch (error) {
      console.error('Code exchange error:', error)
      return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url))
    }
  }

  // Method 3: Handle token_hash flow
  if (token_hash) {
    console.log('Method 3: Using token_hash')
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      })

      if (error) {
        console.error('Token hash verification error:', error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (!data?.session || !data?.user) {
        console.error('No session or user data from token hash verification')
        return NextResponse.redirect(new URL('/login?error=No session created', request.url))
      }

      console.log('Token hash verification success - user:', data.user.email)
      
      // Set cookies and redirect
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
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.redirect(new URL(next, request.url))
    } catch (error) {
      console.error('Token hash verification error:', error)
      return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url))
    }
  }

  // Method 4: Handle fragment parameters by serving a client-side page
  // Since fragments are not sent to the server, we need to handle them client-side
  console.log('No server-side parameters found, checking for fragment parameters')
  
  // Return a client-side page that will handle the fragment
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Processing Authentication...</title>
    </head>
    <body>
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Processing your authentication...</h2>
        <p>Please wait while we verify your login.</p>
      </div>
      <script>
        // Extract fragment parameters
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const token_type = params.get('token_type');
        const expires_at = params.get('expires_at');
        const type = params.get('type');
        
        console.log('Fragment params:', {
          access_token: access_token ? 'present' : 'missing',
          refresh_token: refresh_token ? 'present' : 'missing',
          token_type,
          expires_at,
          type
        });
        
        if (access_token && refresh_token) {
          // Send the tokens to our API endpoint for processing
          fetch('/api/auth/callback-fragment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token,
              refresh_token,
              token_type,
              expires_at,
              type
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Redirect to dashboard
              window.location.href = '/dashboard';
            } else {
              // Redirect to login with error
              window.location.href = '/login?error=' + encodeURIComponent(data.error || 'Authentication failed');
            }
          })
          .catch(error => {
            console.error('Error processing authentication:', error);
            window.location.href = '/login?error=Authentication failed';
          });
        } else {
          // No valid tokens found
          console.error('No valid authentication tokens found in fragment');
          window.location.href = '/login?error=Invalid authentication parameters';
        }
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
