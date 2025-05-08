// src/plugins/inactivity.js
import useInactivityTracker from '@/composables/useInactivityTracker';

export default {
  install(app) {
    // Create a reactive reference to store the inactivity tracker
    const { resetTimer, cleanup } = useInactivityTracker({
      timeout: 15 * 60 * 1000, // 15 minutes
      onTimeout: () => {
        console.log('Session expired due to inactivity');
      }
    });
    
    // Expose the reset function globally for use in the auth middleware
    window.resetInactivityTimer = resetTimer;
    
    // Add a cleanup hook when the app is unmounted
    app.unmount = () => {
      cleanup();
      delete window.resetInactivityTimer;
    };
  }
};