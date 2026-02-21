import { supabase } from './supabase'
import { sanitizeInput } from './sanitize'
import { handleError, validateInput } from './error-handler'
import { sessionManager } from './session-manager'

export const logActivity = async (
  adminEmail: string,
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'access_denied',
  resourceType: 'category' | 'question' | 'auth' | 'file',
  resourceId: string,
  resourceName: string,
  details?: any
) => {
  try {
    // Validate inputs
    const validatedEmail = validateInput(adminEmail, 'Admin email')
    const validatedResourceId = validateInput(resourceId, 'Resource ID')
    const validatedResourceName = validateInput(resourceName, 'Resource name')
    
    // Get session info for enhanced logging
    const session = sessionManager.getSession()
    const enhancedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      session_id: session?.userId || 'anonymous',
      ip_address: 'client-side', // Would be populated server-side
      severity: getSeverityLevel(action, resourceType)
    }
    
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        admin_email: sanitizeInput(validatedEmail),
        action,
        resource_type: resourceType,
        resource_id: sanitizeInput(validatedResourceId),
        resource_name: sanitizeInput(validatedResourceName),
        details: enhancedDetails
      }])

    if (error) {
      handleError(error, 'Activity logging')
    }
  } catch (err) {
    handleError(err, 'Activity logging')
  }
}

// Enhanced logging functions
export const logSecurityEvent = async (
  adminEmail: string,
  event: 'login_attempt' | 'login_success' | 'login_failed' | 'access_denied' | 'rate_limit_exceeded',
  details?: any
) => {
  try {
    // Use the same pattern as existing logActivity function
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        admin_email: adminEmail || 'unknown',
        action: 'create', // Use only 'create' which should be allowed
        resource_type: 'category', // Use 'category' which should be allowed
        resource_id: 'security-event',
        resource_name: event,
        details: { event, ...details }
      })

    if (error) {
      // Sanitize error message before logging to prevent log injection
      const sanitizedMessage = error.message ? error.message.replace(/[\r\n\t]/g, ' ').substring(0, 200) : 'Unknown error'
      console.error('Security logging failed:', sanitizedMessage)
    }
  } catch (err) {
    console.error('Security logging error:', err)
  }
}

export const logFileOperation = async (
  adminEmail: string,
  operation: 'upload' | 'delete' | 'validation_failed',
  fileName: string,
  details?: any
) => {
  await logActivity(adminEmail, operation === 'upload' ? 'create' : 'delete', 'file', fileName, fileName, {
    ...details,
    file_operation: true
  })
}

function getSeverityLevel(action: string, resourceType: string): 'low' | 'medium' | 'high' {
  if (action === 'delete') return 'high'
  if (resourceType === 'auth') return 'high'
  if (action === 'create') return 'medium'
  return 'low'
}