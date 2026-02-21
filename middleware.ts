import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/master-dashboard', 
    '/admin-management',
    '/activity-logs',
    '/backup-export',
    '/bulk-import',
    '/game-analytics',
    '/quick-add',
    '/team-setup',
    '/api'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get the session token from cookies
    const token = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    // If no tokens, redirect to login
    if (!token && !refreshToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify the session with Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false
        }
      })

      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check if user exists in the admins table and get their role
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('role, status')
        .eq('email', user.email)
        .single()

      // If user is not in admins table or is inactive, redirect to login
      if (adminError || !adminData || adminData.status !== 'active') {
        process.env.NODE_ENV === 'development' && console.warn(`Access denied for ${user.email}: Not an active admin.`)
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const userRole = adminData.role
      const isMasterAdmin = userRole === 'master_admin'

      // Check master admin routes
      const masterAdminRoutes = [
        '/master-dashboard', 
        '/admin-management', 
        '/activity-logs', 
        '/backup-export', 
        '/bulk-import', 
        '/game-analytics', 
        '/quick-add'
      ]
      const isMasterAdminRoute = masterAdminRoutes.some(route => pathname.startsWith(route))
      
      if (isMasterAdminRoute && !isMasterAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Auth verification failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|nbk-logo.png|nbk-building.png|diamond.webp|JW.png).*)',
  ],
}
