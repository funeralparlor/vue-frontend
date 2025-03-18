<script setup>
import { ref, computed } from 'vue';
import api from '../services/api';

const student = ref({
  student_id: '',
  last_name: '',
  first_name: '',
  middle_name: '',
  semester: '',
  course: '',
  campus: '',
  scholarship_type: ''
});

const error = ref(null);
const isLoading = ref(false);
const successMessage = ref('');
const emit = defineEmits(['studentCreated']); // Emit event name
const importModalOpen = ref(false);
const fileInput = ref(null);
const importError = ref(null);
const importSuccess = ref(null);
const isImporting = ref(false);

const openImportModal = () => {
  importModalOpen.value = true;
};


// Validation rules updated for student fields
const validationErrors = computed(() => {
  const errors = {};
  if (!student.value.student_id?.trim()) {
    errors.student_id = 'Student ID is required';
  }
  if (!student.value.last_name?.trim()) {
    errors.last_name = 'Last Name is required';
  }
  if (!student.value.first_name?.trim()) {
    errors.first_name = 'First Name is required';
  }
  if (!student.value.semester?.trim()) {
    errors.semester = 'Semester is required';
  }
  if (!student.value.course?.trim()) {
    errors.course = 'Course is required';
  }
  if (!student.value.campus?.trim()) {
    errors.campus = 'Campus is required';
  }
  if (!student.value.scholarship_type?.trim()) {
    errors.scholarship_type = 'Scholarship Type is required';
  }
  return errors;
});

const isFormValid = computed(() => {
  return Object.keys(validationErrors.value).length === 0;
});

const createStudent = async () => { // Renamed function
  if (!isFormValid.value) return;

  error.value = null;
  isLoading.value = true;

  try {
    const response = await api.post('/students', student.value); // Endpoint
    emit('studentCreated', response.data); // Emit name
    // Reset form with all student fields
    student.value = { 
      student_id: '',
      last_name: '',
      first_name: '',
      middle_name: '',
      semester: '',
      course: '',
      campus: '',
      scholarship_type: ''
    };
    successMessage.value = 'Student created successfully!';
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create student';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="createStudent" class="space-y-4">
    <!-- Student ID Field -->
    <div>
      <label for="student_id" class="block text-sm font-medium text-gray-700">Student ID</label>
      <div class="mt-1">
        <input
          id="student_id"
          v-model="student.student_id"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500',
            validationErrors.student_id ? 'border-red-500' : 'border-gray-300',
          ]"
          aria-describedby="student_id-error"
          placeholder="Enter student ID"
        />
      </div>
      <p v-if="validationErrors.student_id" id="student_id-error" class="mt-2 text-sm text-red-600">
        {{ validationErrors.student_id }}
      </p>
    </div>

    <!-- Name Fields -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          id="last_name"
          v-model="student.last_name"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
            validationErrors.last_name ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter last name"
        />
        <p v-if="validationErrors.last_name" class="mt-2 text-sm text-red-600">
          {{ validationErrors.last_name }}
        </p>
      </div>

      <div>
        <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
        <input
          id="first_name"
          v-model="student.first_name"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
            validationErrors.first_name ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter first name"
        />
        <p v-if="validationErrors.first_name" class="mt-2 text-sm text-red-600">
          {{ validationErrors.first_name }}
        </p>
      </div>

      <div>
        <label for="middle_name" class="block text-sm font-medium text-gray-700">Middle Name</label>
        <input
          id="middle_name"
          v-model="student.middle_name"
          type="text"
          :class="'block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1'"
          placeholder="Enter middle name (optional)"
        />
      </div>
    </div>

    <!-- Academic Information -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="semester" class="block text-sm font-medium text-gray-700">Semester</label>
        <input
          id="semester"
          v-model="student.semester"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
            validationErrors.semester ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter semester"
        />
        <p v-if="validationErrors.semester" class="mt-2 text-sm text-red-600">
          {{ validationErrors.semester }}
        </p>
      </div>

      <div>
        <label for="course" class="block text-sm font-medium text-gray-700">Course</label>
        <input
          id="course"
          v-model="student.course"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
            validationErrors.course ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter course"
        />
        <p v-if="validationErrors.course" class="mt-2 text-sm text-red-600">
          {{ validationErrors.course }}
        </p>
      </div>

      <div>
        <label for="campus" class="block text-sm font-medium text-gray-700">Campus</label>
        <input
          id="campus"
          v-model="student.campus"
          type="text"
          required
          :class="[
            'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
            validationErrors.campus ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter campus"
        />
        <p v-if="validationErrors.campus" class="mt-2 text-sm text-red-600">
          {{ validationErrors.campus }}
        </p>
      </div>
    </div>

    <!-- Scholarship Type -->
    <div>
      <label for="scholarship_type" class="block text-sm font-medium text-gray-700">Scholarship Type</label>
      <select
        id="scholarship_type"
        v-model="student.scholarship_type"
        required
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 mt-1',
          validationErrors.scholarship_type ? 'border-red-500' : 'border-gray-300',
        ]"
      >
        <option value="">Select scholarship type</option>
        <option value="Academic">Academic</option>
        <option value="Athletic">Athletic</option>
        <option value="Need-Based">Need-Based</option>
        <option value="Government">Government</option>
      </select>
      <p v-if="validationErrors.scholarship_type" class="mt-2 text-sm text-red-600">
        {{ validationErrors.scholarship_type }}
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md bg-red-50 p-4">
      <div class="flex items-center">
        <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
        <p class="ml-3 text-sm text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 text-green-400" aria-hidden="true" />
        <p class="ml-3 text-sm text-green-700">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="!isFormValid || isLoading"
        :class="[
          'rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
          isLoading || !isFormValid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
        ]"
      >
        {{ isLoading ? 'Creating...' : 'Create Student' }}
      </button>
    </div>
  </form>
</template>

    