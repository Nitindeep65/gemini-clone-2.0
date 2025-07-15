import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow auth callback to pass through
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // Check if user is accessing the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('sb-token')
    const userCookie = request.cookies.get('sb-user')
    
    if (!token && !userCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/callback']
}
