import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    // Get user session from cookie or header
    const userRole = request.cookies.get('user_role')?.value

    // For demo purposes, check localStorage will be handled client-side
    // In production, use NextAuth or your auth system

    // Redirect if not admin (this is a basic check)
    // In production, verify JWT token and role from database
    if (!userRole || userRole !== 'admin') {
      // Allow access for development - remove this in production
      console.log('Admin access attempt without proper role')
      // return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
