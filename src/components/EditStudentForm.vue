<script setup>
import { ref, watch } from 'vue';
import api from '../services/api';

// Define props and emits with clear documentation
const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['studentUpdated', 'cancel']);

// Reactive state
const updatedStudent = ref({ ...props.student });
const error = ref(null);
const isSubmitting = ref(false); // Added loading state

// Watch for changes in props.student and update the form
watch(
  () => props.student,
  (newStudent) => {
    updatedStudent.value = { ...newStudent };
  },
  { deep: true }
);

// Handle form submission
const updateStudent = async () => {
  error.value = null;
  isSubmitting.value = true;

  try {
    const response = await api.put(`/students/${updatedStudent.value.id}`, updatedStudent.value);
    emit('studentUpdated', response.data);
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update student';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="updateStudent" class="space-y-6 bg-white p-6 rounded-lg shadow">
    <!-- Error Message -->
    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <!-- Student Information Section -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Student Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Student ID -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Student ID</label>
          <input
            v-model="updatedStudent.student_id"
            type="text"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            readonly
          />
        </div>
        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input
            v-model="updatedStudent.last_name"
            type="text"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>

    <!-- Name Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- First Name -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
        <input
          v-model="updatedStudent.first_name"
          type="text"
          class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <!-- Middle Name -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
        <input
          v-model="updatedStudent.middle_name"
          type="text"
          class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Academic Details Section -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Academic Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Semester -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Semester</label>
          <input
            v-model="updatedStudent.semester"
            type="text"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <!-- Course -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Course</label>
          <input
            v-model="updatedStudent.course"
            type="text"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>

    <!-- Additional Information Section -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Additional Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Campus -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Campus</label>
          <input
            v-model="updatedStudent.campus"
            type="text"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <!-- Scholarship Type -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Scholarship Type</label>
          <select
            v-model="updatedStudent.scholarship_type"
            class="block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select scholarship type</option>
            <option value="Academic">Academic</option>
            <option value="Athletic">Athletic</option>
            <option value="Need-Based">Need-Based</option>
            <option value="Government">Government</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-6">
      <button
        type="button"
        @click="$emit('cancel')"
        class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
      >
        {{ isSubmitting ? 'Updating...' : 'Update Student' }}
      </button>
    </div>
  </form>
</template>