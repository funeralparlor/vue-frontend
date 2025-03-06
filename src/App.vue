<script>
import { RouterView } from 'vue-router'
import { ref } from 'vue';
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
</script>

<template>
  <RouterView /> <!-- This renders your current route component -->
</template>

<style>
/* Add global styles here if needed */
</style>