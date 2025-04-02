// src/composables/useInactivityTracker.js
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

export default function useInactivityTracker(options = {}) {
  const {
    timeout = 15 * 60 * 1000, // Default 15 minutes
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    onLogout = () => {},
  } = options;

  const router = useRouter();
  const inactivityTimer = ref(null);
  const isActive = ref(true);

  const resetTimer = () => {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
    }
    
    inactivityTimer.value = setTimeout(async () => {
      isActive.value = false;
      
      try {
        // Call the logout API endpoint
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear local storage regardless of API success
        localStorage.removeItem('token');
        
        // Redirect to login page
        router.push({ name: 'login' });
        
        // Call the custom logout handler if provided
        onLogout();
      }
    }, timeout);
  };

  const setupEventListeners = () => {
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();
  };

  const cleanupEventListeners = () => {
    events.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
    }
  };

  onMounted(() => {
    // Only start the inactivity tracker if the user is logged in
    if (localStorage.getItem('token')) {
      setupEventListeners();
    }
  });

  onUnmounted(() => {
    cleanupEventListeners();
  });

  return {
    isActive,
    resetTimer,
    cleanup: cleanupEventListeners
  };
}