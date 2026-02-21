// Complete authentication reset script
// Run this in browser console to completely reset authentication state

console.log('🔄 Starting complete authentication reset...');

// Clear all localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear all sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

// Clear IndexedDB (Supabase might use this)
if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
        databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
        });
    });
    console.log('✅ IndexedDB cleared');
}

// Clear cache if possible
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
        });
    });
    console.log('✅ Cache cleared');
}

console.log('🎉 Complete authentication reset finished!');
console.log('📝 Now try logging in again with your credentials.');
console.log('🔍 If issues persist, check the debug page at /debug-auth');

// Reload the page to start fresh
setTimeout(() => {
    window.location.href = '/login';
}, 1000);