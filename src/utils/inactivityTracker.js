export function setupInactivityTimer(logoutCallback, timeoutMinutes = 15) {
    let timeout;
  
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logoutCallback, timeoutMinutes * 60 * 1000);
    };
  
    // Reset timer on user activity events
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
  
    // Initialize timer
    resetTimer();
  }