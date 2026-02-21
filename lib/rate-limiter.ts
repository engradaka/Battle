// Simple client-side rate limiting
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (entry.count >= this.maxAttempts) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry) return 0
    
    const remaining = entry.resetTime - Date.now()
    return Math.max(0, Math.ceil(remaining / 1000)) // Return seconds
  }

  reset(identifier: string): void {
    this.limits.delete(identifier)
  }
}

// Global rate limiter instances
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const searchRateLimiter = new RateLimiter(30, 60 * 1000) // 30 searches per minute
export const apiRateLimiter = new RateLimiter(100, 60 * 1000) // 100 API calls per minute