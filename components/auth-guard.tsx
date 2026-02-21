"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sessionManager } from '@/lib/session-manager'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireMasterAdmin?: boolean
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireMasterAdmin = false 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
    
    // Simplified cache control for protected pages
    if (requireAuth && typeof window !== 'undefined') {
      // Only add basic cache control
      let meta = document.querySelector(`meta[http-equiv="Cache-Control"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('http-equiv', 'Cache-Control')
        meta.setAttribute('content', 'no-cache')
        document.head.appendChild(meta)
      }
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        sessionManager.clearSession()
        setIsAuthenticated(false)
        setUserEmail(null)
        if (requireAuth) {
          router.replace('/login')
        }
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [requireAuth, requireMasterAdmin, router, pathname])

  const checkAuth = async () => {
    try {
      // First check local session
      const localSession = sessionManager.getSession()
      
      // Then verify with Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        setIsAuthenticated(false)
        setUserEmail(null)
        
        if (requireAuth && pathname !== '/login') {
          router.push('/login')
          return
        }
      } else {
        const email = session.user.email
        setUserEmail(email || null)
        
        // Check master admin requirement
        if (requireMasterAdmin && email !== process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL) {
          router.push('/dashboard')
          return
        }
        
        // Update session activity if local session exists
        if (localSession) {
          sessionManager.updateActivity()
        } else {
          // Create local session if it doesn't exist but Supabase session is valid
          const role = email === process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL ? 'master_admin' : 'admin'
          sessionManager.setSession(session.user.id, email || '', role)
        }
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUserEmail(null)
      
      if (requireAuth) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}