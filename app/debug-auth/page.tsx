"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { sessionManager } from '@/lib/session-manager'
import { loginRateLimiter } from '@/lib/rate-limiter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [sessionState, setSessionState] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>({})
  const [rateLimitInfo, setRateLimitInfo] = useState<any>({})

  useEffect(() => {
    checkAuthState()
    checkSessionState()
    checkEnvVars()
  }, [])

  const checkAuthState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setAuthState({
        session: session ? {
          user: session.user,
          expires_at: session.expires_at
        } : null,
        error: error?.message
      })
    } catch (error: any) {
      setAuthState({ error: error.message })
    }
  }

  const checkSessionState = () => {
    const localSession = sessionManager.getSession()
    setSessionState({
      localSession,
      isValid: sessionManager.isSessionValid(),
      remainingTime: sessionManager.getRemainingTime()
    })
  }

  const checkEnvVars = () => {
    setEnvVars({
      masterAdminEmail: process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }

  const checkRateLimit = () => {
    const testEmail = 'engradaka@gmail.com'
    setRateLimitInfo({
      isAllowed: loginRateLimiter.isAllowed(testEmail),
      remainingTime: loginRateLimiter.getRemainingTime(testEmail)
    })
  }

  const clearAllData = () => {
    sessionManager.clearSession()
    localStorage.clear()
    sessionStorage.clear()
    loginRateLimiter.reset('engradaka@gmail.com')
    alert('All data cleared! Try logging in again.')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Auth State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(authState, null, 2)}
              </pre>
              <Button onClick={checkAuthState} className="mt-4">
                Refresh Auth State
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Local Session State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(sessionState, null, 2)}
              </pre>
              <Button onClick={checkSessionState} className="mt-4">
                Refresh Session State
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(envVars, null, 2)}
              </pre>
              <Button onClick={checkEnvVars} className="mt-4">
                Refresh Env Vars
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(rateLimitInfo, null, 2)}
              </pre>
              <Button onClick={checkRateLimit} className="mt-4">
                Check Rate Limit
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={clearAllData} variant="destructive">
            Clear All Data & Reset Rate Limits
          </Button>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login Page
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if environment variables are loaded correctly</li>
              <li>Verify Supabase connection and auth state</li>
              <li>Clear all data and rate limits if needed</li>
              <li>Try logging in with correct credentials</li>
              <li>Check browser console for any errors</li>
              <li>Verify the master admin email matches exactly</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}