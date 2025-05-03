// This script should be loaded in the browser when visiting /api/auth/reset
// It will clear all client-side authentication state

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  // Clear all Supabase auth-related items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('auth') ||
      key.startsWith('next-auth')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the keys we found
  keysToRemove.forEach(key => {
    console.log('Removing from localStorage:', key);
    localStorage.removeItem(key);
  });
  
  // Also clear our custom backup items
  localStorage.removeItem('supabase-auth-user-email');
  localStorage.removeItem('supabase-auth-user-id');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('SessionStorage cleared');
}

// Inform the user
document.getElementById('status').innerText = 'Client-side auth state cleared!';

// Redirect to login after a short delay
setTimeout(() => {
  window.location.href = '/login';
}, 2000);
