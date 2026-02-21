// Simple script to reset authentication state
// Run this in browser console if needed

console.log('Clearing all authentication data...')

// Clear localStorage
localStorage.clear()
console.log('✓ localStorage cleared')

// Clear sessionStorage  
sessionStorage.clear()
console.log('✓ sessionStorage cleared')

// Clear specific Supabase keys
const keysToRemove = [
  'supabase.auth.token',
  'sb-uablgqkjivzbdqmiqbls-auth-token',
  'quiz_session'
]

keysToRemove.forEach(key => {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
})
console.log('✓ Supabase auth keys cleared')

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})
console.log('✓ Cookies cleared')

console.log('🎉 All authentication data cleared! You can now try logging in again.')
console.log('Navigate to /login or /debug-auth to test')