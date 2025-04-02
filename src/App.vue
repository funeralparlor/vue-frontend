<script>
import { RouterView, useRouter } from 'vue-router'
import { ref, watch } from 'vue';
import api from '@/services/api'; // Import your Axios instance





export default {
  
  setup() {
    // Reactive data
    const courses = ref([]);
    const student = ref({
      college: '', // Selected college
      course: '',  // Selected course
    });
    const validationErrors = ref({
      course: '',
    });
    const COLLEGES = ref([
      { value: 'CAFA', label: 'College of Architecture and Fine Arts (CAFA)' },
      { value: 'CAL', label: 'College of Arts and Letters (CAL)' },
      { value: 'CBEA', label: 'College of Business Education and Accountancy (CBEA)' },
      // Add other colleges here
    ]);
  
    const isLoading = ref(false); // Loading state

    // Method to fetch courses
    const fetchCourses = () => {
      if (student.value.college) {
        isLoading.value = true; // Show loading state
        courses.value = []; // Clear previous courses

        // Use the `api` instance to make the API call
        api.get(`/colleges/${student.value.college}/courses`)
          .then(response => {
            courses.value = response.data; // Update courses with API response
          })
          .catch(error => {
            console.error('Error fetching courses:', error);
            courses.value = []; // Clear courses on error
          })
          .finally(() => {
            isLoading.value = false; // Hide loading state
          });
      } else {
        courses.value = []; // Clear courses if no college is selected
      }
    };

    // Expose data and methods to the template
    return {
      student,
      validationErrors,
      COLLEGES,
      courses,
      isLoading,
      fetchCourses,
    };
  },
};


const router = useRouter();
const showSessionWarning = ref(false);
const logoutCountdown = ref(0);

const logout = () => {
    localStorage.removeItem('token');
    router.push({ name: 'login' });
};

const handleWarning = (seconds) => {
    logoutCountdown.value = seconds;
    showSessionWarning.value = true;
};

let inactivityTimer;







</script>

<template>

   <div v-if="showSessionWarning" class="session-warning-overlay">
        <div class="session-warning-modal">
            <h3>Session Timeout Warning</h3>
            <p>Your session will expire in {{ logoutCountdown }} seconds due to inactivity.</p>
            <button @click="() => {
                showSessionWarning = false;
                // Any activity will automatically reset the timer
            }">
                Continue Session
            </button>
        </div>
    </div>
    
  <RouterView /> <!-- This renders your current route component -->
</template>

<style scoped>
.session-warning-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.session-warning-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    text-align: center;
}
</style>@/composables/useInactivityTracker