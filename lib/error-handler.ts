// Global error handling utility
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleError = (error: unknown, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const contextMessage = context ? `[${context}] ` : ''
  
  console.error(`${contextMessage}Error:`, errorMessage)
  
  // In production, you might want to send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error)
  }
}

export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> => {
  try {
    return await asyncFn()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

export const validateInput = (input: unknown, fieldName: string): string => {
  if (typeof input !== 'string') {
    throw new AppError(`${fieldName} must be a string`, 400)
  }
  
  const trimmed = input.trim()
  
  if (trimmed.length === 0) {
    throw new AppError(`${fieldName} cannot be empty`, 400)
  }
  
  if (input.length > 1000) {
    throw new AppError(`${fieldName} is too long`, 400)
  }
  
  return trimmed
}