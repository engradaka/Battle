// Session management utility
interface SessionData {
  userId: string
  email: string
  role: string
  loginTime: number
  lastActivity: number
  expiresAt: number
  sessionId: string
}

class SessionManager {
  private readonly SESSION_KEY = 'quiz_session'
  private readonly SESSION_TIMEOUT = 3600000 // 1 hour in milliseconds
  private readonly ACTIVITY_TIMEOUT = 1800000 // 30 minutes in milliseconds
  private activityTimer: NodeJS.Timeout | null = null

  setSession(userId: string, email: string, role: string): void {
    const now = Date.now()
    const sessionId = this.generateSessionId()
    const sessionData: SessionData = {
      userId,
      email,
      role,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + this.SESSION_TIMEOUT,
      sessionId
    }
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
    this.startActivityTimer()
  }

  getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY)
      if (!sessionStr) return null

      const session: SessionData = JSON.parse(sessionStr)
      const now = Date.now()

      // Check if session expired
      if (now > session.expiresAt) {
        this.clearSession()
        return null
      }

      // Check activity timeout
      if (now - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        this.clearSession()
        return null
      }

      return session
    } catch {
      this.clearSession()
      return null
    }
  }

  updateActivity(): void {
    const session = this.getSession()
    if (session) {
      session.lastActivity = Date.now()
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      this.startActivityTimer()
    }
  }

  extendSession(): void {
    const session = this.getSession()
    if (session) {
      const now = Date.now()
      session.expiresAt = now + this.SESSION_TIMEOUT
      session.lastActivity = now
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY)
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
      this.activityTimer = null
    }
  }

  isSessionValid(): boolean {
    return this.getSession() !== null
  }

  getRemainingTime(): number {
    const session = this.getSession()
    if (!session) return 0
    
    return Math.max(0, session.expiresAt - Date.now())
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private startActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
    
    // Auto-clear session after activity timeout
    this.activityTimer = setTimeout(() => {
      const session = this.getSession()
      if (session && Date.now() - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        this.clearSession()
        // Trigger a custom event to notify components
        window.dispatchEvent(new CustomEvent('sessionExpired'))
      }
    }, this.ACTIVITY_TIMEOUT)
  }

  // Validate session integrity
  validateSession(): boolean {
    const session = this.getSession()
    if (!session) return false
    
    // Check if session data is valid
    if (!session.sessionId || !session.email || !session.userId) {
      this.clearSession()
      return false
    }
    
    return true
  }

  // Force logout and clear all data
  forceLogout(): void {
    this.clearSession()
    
    // Clear browser history to prevent back navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/login')
      window.location.replace('/login')
    }
  }

  // Check if user is accessing protected page without auth
  checkPageAccess(pathname: string): boolean {
    const protectedPaths = ['/dashboard', '/master-dashboard', '/admin-management', '/activity-logs']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    
    if (isProtectedPath && !this.isSessionValid()) {
      this.forceLogout()
      return false
    }
    
    return true
  }
}

export const sessionManager = new SessionManager()

// Basic session management
if (typeof window !== 'undefined') {
  // Update activity on page focus
  window.addEventListener('focus', () => {
    const session = sessionManager.getSession()
    if (session) {
      sessionManager.updateActivity()
    }
  })
}