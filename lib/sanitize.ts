// Input sanitization utility for security
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return map[match]
    })
    .replace(/[\r\n\t]/g, '') // Remove newlines and tabs for log injection
    .trim()
}

// Sanitize for database queries
export const sanitizeForDB = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/['"\\;]/g, '') // Remove SQL injection characters
    .trim()
    .substring(0, 1000) // Limit length
}

// Sanitize HTML content
export const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, (match) => match === '<' ? '&lt;' : '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}