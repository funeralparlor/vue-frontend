// src/router/auth.js
import api from '@/services/api';

export default async function auth({ to, from, next }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return next({ name: 'login' });
  }
  
  try {
    // Verify token is still valid with the API
    await api.get('/user');
    
    // Reset the inactivity timer when navigating between protected routes
    // This is optional, but helps ensure the timer is in sync with navigation
    if (window.resetInactivityTimer && typeof window.resetInactivityTimer === 'function') {
      window.resetInactivityTimer();
    }
    
    return next();
  } catch (error) {
    // Token is invalid or expired
    console.error('Authentication failed:', error);
    localStorage.removeItem('token');
    return next({ name: 'login' });
  }
}