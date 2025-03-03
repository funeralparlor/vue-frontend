<script setup>
import { ref, computed, reactive } from 'vue';
import api from '../services/api';

// Use reactive for complex objects
const student = reactive({
  student_id: '',
  last_name: '',
  first_name: '',
  middle_name: '',
  semester: '',
  course: '',
  campus: '',
  scholarship_type: ''
});

// Constants for form options
const SCHOLARSHIP_TYPES = [
  { value: 'Academic', label: 'Academic' },
  { value: 'Athletic', label: 'Athletic' },
  { value: 'Need-Based', label: 'Need-Based' },
  { value: 'Government', label: 'Government' }
];

// Form state
const error = ref(null);
const isLoading = ref(false);
const successMessage = ref('');
const emit = defineEmits(['studentCreated', 'close']);

// File import state
const importFile = ref(null);
const importErrors = ref({});
const importSuccess = ref('');
const isImporting = ref(false);

// Centralized validation rules
const validationRules = {
  student_id: (value) => !!value?.trim() || 'Student ID is required',
  last_name: (value) => !!value?.trim() || 'Last Name is required',
  first_name: (value) => !!value?.trim() || 'First Name is required',
  semester: (value) => !!value?.trim() || 'Semester is required',
  course: (value) => !!value?.trim() || 'Course is required',
  campus: (value) => !!value?.trim() || 'Campus is required',
  scholarship_type: (value) => !!value?.trim() || 'Scholarship Type is required',
};

// Computed validation errors
const validationErrors = computed(() => {
  const errors = {};
  
  Object.entries(validationRules).forEach(([field, rule]) => {
    const result = rule(student[field]);
    if (result !== true) {
      errors[field] = result;
    }
  });
  
  return errors;
});

const isFormValid = computed(() => Object.keys(validationErrors.value).length === 0);

// Reset form to initial state
const resetForm = () => {
  Object.keys(student).forEach(key => {
    student[key] = '';
  });
  error.value = null;
  successMessage.value = '';
};

// Form submission handler
const createStudent = async () => {
  if (!isFormValid.value) return;

  error.value = null;
  isLoading.value = true;

  try {
    const response = await api.post('/students', student);
    emit('studentCreated', response.data);
    resetForm();
    successMessage.value = 'Student created successfully!';
    
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create student';
  } finally {
    isLoading.value = false;
  }
};

// File import handler
const handleFileUpload = async () => {
  if (!importFile.value) return;

  const formData = new FormData();
  formData.append('file', importFile.value);
  
  importErrors.value = {};
  importSuccess.value = '';
  isImporting.value = true;

  try {
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    importSuccess.value = `Successfully imported ${response.data.count} students`;
    importFile.value = null;
    
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      importSuccess.value = '';
    }, 3000);
  } catch (err) {
    if (err.response?.status === 422) {
      importErrors.value = err.response.data.errors;
    } else {
      error.value = err.response?.data?.message || 'Import failed';
    }
  } finally {
    isImporting.value = false;
  }
};

// Handle close modal function
const closeModal = () => {
  emit('close');
};
</script>

<template>
  <!-- Modal overlay with focus trap and keyboard accessibility -->
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50"
    @keydown.esc="closeModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal container with responsive width -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
      <!-- Modal header -->
      <div class="flex justify-between items-center border-b px-6 py-4">
        <h3 class="text-xl font-semibold text-gray-800">Create Student</h3>
        <button 
        @click="$emit('cancel')" 
          class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Modal content -->
      <div class="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
        <!-- Import Section -->
        <section class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">Import Students from Excel</h2>
          
          <div class="flex flex-col sm:flex-row gap-3 items-start">
            <input
              type="file"
              accept=".xls,.xlsx,.xlsm"
              @change="e => importFile = e.target.files[0]"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              :disabled="isImporting"
            />
            
            <button
              @click="handleFileUpload"
              :disabled="!importFile || isImporting"
              class="rounded-md px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isImporting">Importing...</span>
              <span v-else>Import Students</span>
            </button>
          </div>
  
          <!-- Import Success Message -->
          <div v-if="importSuccess" class="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="ml-3 text-sm text-green-700">{{ importSuccess }}</p>
            </div>
          </div>
  
          <!-- Import Errors -->
          <div v-if="Object.keys(importErrors).length" class="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 class="ml-3 text-sm font-medium text-red-800">Import Errors</h3>
            </div>
            <div v-for="(errors, row) in importErrors" :key="row" class="mt-2">
              <p class="text-sm text-red-700 font-medium">{{ row }}:</p>
              <ul class="list-disc pl-5">
                <li v-for="(error, i) in errors" :key="i" class="text-sm text-red-600">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </section>
  
        <!-- Form Section -->
        <form @submit.prevent="createStudent" class="space-y-5">
          <!-- Student ID Field -->
          <div>
            <label for="student_id" class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              id="student_id"
              v-model="student.student_id"
              type="text"
              :class="[
                'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                validationErrors.student_id ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Enter student ID"
              autocomplete="off"
            />
            <p v-if="validationErrors.student_id" class="mt-1 text-sm text-red-600">
              {{ validationErrors.student_id }}
            </p>
          </div>
  
          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                id="last_name"
                v-model="student.last_name"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.last_name ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter last name"
              />
              <p v-if="validationErrors.last_name" class="mt-1 text-sm text-red-600">
                {{ validationErrors.last_name }}
              </p>
            </div>
  
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                id="first_name"
                v-model="student.first_name"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.first_name ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter first name"
              />
              <p v-if="validationErrors.first_name" class="mt-1 text-sm text-red-600">
                {{ validationErrors.first_name }}
              </p>
            </div>
  
            <div>
              <label for="middle_name" class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                id="middle_name"
                v-model="student.middle_name"
                type="text"
                class="block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter middle name (optional)"
              />
            </div>
          </div>
  
          <!-- Academic Information -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="semester" class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input
                id="semester"
                v-model="student.semester"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.semester ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter semester"
              />
              <p v-if="validationErrors.semester" class="mt-1 text-sm text-red-600">
                {{ validationErrors.semester }}
              </p>
            </div>
  
            <div>
              <label for="course" class="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                id="course"
                v-model="student.course"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.course ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter course"
              />
              <p v-if="validationErrors.course" class="mt-1 text-sm text-red-600">
                {{ validationErrors.course }}
              </p>
            </div>
  
            <div>
              <label for="campus" class="block text-sm font-medium text-gray-700 mb-1">Campus</label>
              <input
                id="campus"
                v-model="student.campus"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.campus ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter campus"
              />
              <p v-if="validationErrors.campus" class="mt-1 text-sm text-red-600">
                {{ validationErrors.campus }}
              </p>
            </div>
          </div>
  
          <!-- Scholarship Type -->
          <div>
            <label for="scholarship_type" class="block text-sm font-medium text-gray-700 mb-1">Scholarship Type</label>
            <select
              id="scholarship_type"
              v-model="student.scholarship_type"
              :class="[
                'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                validationErrors.scholarship_type ? 'border-red-500' : 'border-gray-300',
              ]"
            >
              <option value="">Select scholarship type</option>
              <option v-for="option in SCHOLARSHIP_TYPES" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="validationErrors.scholarship_type" class="mt-1 text-sm text-red-600">
              {{ validationErrors.scholarship_type }}
            </p>
          </div>
  
          <!-- Error Message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p class="ml-3 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
  
          <!-- Success Message -->
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4 border border-green-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="ml-3 text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
  
          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="$emit('cancel')"
              class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              :class="[
                'rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                isLoading || !isFormValid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
              ]"
            >
              {{ isLoading ? 'Creating...' : 'Create Student' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>