// src/composables/useInactivityTimer.js
import { onMounted, onUnmounted, ref } from 'vue';

export default function useInactivityTimer(logoutCallback, warningCallback, options = {}) {
    const {
        timeoutMinutes = 25,
        warningMinutes = 5,
        events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    } = options;

    const timer = ref(null);
    const warningTimer = ref(null);
    const countdown = ref(0);
    const showWarning = ref(false);

    const resetTimers = () => {
        clearTimeout(timer.value);
        clearTimeout(warningTimer.value);
        showWarning.value = false;

        const timeoutMs = timeoutMinutes * 60 * 1000;
        const warningMs = warningMinutes * 60 * 1000;

        // Set warning timer
        warningTimer.value = setTimeout(() => {
            showWarning.value = true;
            countdown.value = warningMinutes * 60;
            warningCallback?.(countdown.value);
            
            const countdownInterval = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }, timeoutMs - warningMs);

        // Set logout timer
        timer.value = setTimeout(() => {
            logoutCallback();
        }, timeoutMs);
    };

    const onActivity = () => {
        resetTimers();
    };

    onMounted(() => {
        events.forEach(event => {
            window.addEventListener(event, onActivity);
        });
        resetTimers();
    });

    onUnmounted(() => {
        events.forEach(event => {
            window.removeEventListener(event, onActivity);
        });
        clearTimeout(timer.value);
        clearTimeout(warningTimer.value);
    });

    return {
        resetTimers,
        showWarning,
        countdown
    };
}