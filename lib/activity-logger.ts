import { supabase } from './supabase'
import { sanitizeInput } from './sanitize'
import { validateInput } from './error-handler'
import { sessionManager } from './session-manager'

export const logActivity = async (
  adminEmail: string,
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'import',
  resourceType: 'category' | 'question' | 'admin_request' | 'bulk_import' | 'settings',
  resourceId: string,
  resourceName: string,
  details?: any
) => {
  try {
    // Validate inputs
    const validatedEmail = validateInput(adminEmail, 'Admin email')
    const validatedResourceName = validateInput(resourceName, 'Resource name')

    // Get session info for enhanced logging
    const session = sessionManager.getSession()
    const enhancedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      session_id: session?.userId || 'anonymous',
    }

    const { error } = await supabase.from('activity_logs').insert([
      {
        admin_email: sanitizeInput(validatedEmail),
        action,
        resource_type: resourceType,
        resource_id: resourceId ? sanitizeInput(resourceId) : null,
        resource_name: sanitizeInput(validatedResourceName),
        details: enhancedDetails,
      },
    ])

    if (error) {
      console.error('Activity logging failed:', error)
    }
  } catch (err) {
    console.error('Activity logging error:', err)
  }
}

// Enhanced logging functions
export const logSecurityEvent = async (
  adminEmail: string,
  event:
    | 'login_attempt'
    | 'login_success'
    | 'login_failed'
    | 'access_denied'
    | 'rate_limit_exceeded',
  details?: any
) => {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      admin_email: adminEmail || 'unknown',
      action: 'create',
      resource_type: 'settings',
      resource_id: 'security-event',
      resource_name: event,
      details: { event, ...details },
    })

    if (error) {
      console.error('Security logging failed:', error.message)
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
  await logActivity(
    adminEmail,
    operation === 'upload' ? 'create' : 'delete',
    'settings',
    fileName,
    fileName,
    {
      ...details,
      file_operation: true,
    }
  )
}
