<script setup>
import { ref, watch, computed, reactive } from 'vue';
import api from '../services/api';

// Define props and emits with clear documentation
const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
  isReadOnly: {
    type: Boolean,
    default: true,
  }
});
const emit = defineEmits(['studentUpdated', 'cancel']);

// Reactive state using reactive for better performance with nested objects
const updatedStudent = ref({ ...props.student });
const formState = reactive({
  error: null,
  isSubmitting: false,
  editableFields: {}
});

// Field definitions moved outside of computed props for better performance
const fieldDefinitions = {
  personalInfo: [
    { key: 'student_id', label: 'Student ID', type: 'text', required: true, readonly: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'middle_name', label: 'Middle Name', type: 'text', required: false },
    { key: 'gender', label: 'Gender', type: 'select', required: true, 
      options: [
        { value: 'M', label: 'Male' },
        { value: 'F', label: 'Female' }
      ]
    },
    { key: 'birthday', label: 'Date of Birth', type: 'date', required: true },
    { key: 'birth_place', label: 'Place of Birth', type: 'text', required: true },
  ],
  academicInfo: [
    { key: 'college', label: 'College Faculty', type: 'text', required: true },
    { key: 'course', label: 'College Course', type: 'text', required: true },
    { key: 'campus', label: 'Campus', type: 'text', required: true },
    { key: 'year_level', label: 'Year Level', type: 'select', required: true },
    { key: 'section', label: 'Section', type: 'text', required: true },
    { key: 'student_status', label: 'Student Status', type: 'select', required: true,
      options: [
        { value: 'Regular', label: 'Regular' },
        { value: 'Irregular', label: 'Irregular' }
      ]
    },
    { key: 'last_sem', label: 'Last Semester', type: 'text', required: true },
    { key: 'scholar_ship', label: 'Scholarship', type: 'text', required: true },
  ],
  contactInfo: [
    { key: 'comp_address', label: 'Complete Address', type: 'text', required: false },
    { key: 'barangay', label: 'Barangay', type: 'text', required: true },
    { key: 'town', label: 'Town/City', type: 'text', required: true },
    { key: 'province', label: 'Province', type: 'text', required: true },
    { key: 'email', label: 'Email Address', type: 'email', required: true },
    { key: 'number', label: 'Mobile Number', type: 'tel', required: true },
  ],
  familyInfo: [
    { key: 'father_name', label: 'Father\'s Full Name', type: 'text', required: false },
    { key: 'father_occup', label: 'Father\'s Occupation', type: 'text', required: true },
    { key: 'mother_name', label: 'Mother\'s Full Name', type: 'text', required: true },
    { key: 'mother_occup', label: 'Mother\'s Occupation', type: 'text', required: true },
  ],
  privacyInfo: [
    { key: 'approved', label: 'Approved to share information', type: 'select', required: true,
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ]
    },
  ]
};

// Use memoized computed properties for form sections
const personalInfo = computed(() => fieldDefinitions.personalInfo);
const academicInfo = computed(() => fieldDefinitions.academicInfo);
const contactInfo = computed(() => fieldDefinitions.contactInfo);
const familyInfo = computed(() => fieldDefinitions.familyInfo);
const privacyInfo = computed(() => fieldDefinitions.privacyInfo);

// Initialize editable state for each field
const initializeEditableFields = () => {
  const allFields = Object.values(fieldDefinitions).flat();
  
  allFields.forEach(field => {
    formState.editableFields[field.key] = !props.isReadOnly;
  });
};

// Initialize editable fields
initializeEditableFields();

// Watch for changes in props.student and update the form
watch(
  () => props.student,
  (newStudent) => {
    updatedStudent.value = { ...newStudent };
  },
  { deep: true }
);

// Watch for changes in isReadOnly prop
watch(
  () => props.isReadOnly,
  (newValue) => {
    Object.keys(formState.editableFields).forEach(key => {
      formState.editableFields[key] = !newValue;
    });
  }
);

// Toggle edit mode for a specific field
const toggleEdit = (field) => {
  formState.editableFields[field] = !formState.editableFields[field];
};

// Handle form submission
const updateStudent = async () => {
  formState.error = null;
  formState.isSubmitting = true;

  try {
    const response = await api.put(`/students/${updatedStudent.value.id}`, updatedStudent.value);
    emit('studentUpdated', response.data);
  } catch (err) {
    formState.error = err.response?.data?.message || 'Failed to update student';
  } finally {
    formState.isSubmitting = false;
  }
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen py-8 px-4">
    <div class="w-full max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <form @submit.prevent="updateStudent" class="space-y-6 p-6">
        <!-- Error Message -->
        <div v-if="formState.error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-700">{{ formState.error }}</p>
          </div>
        </div>

        <div class="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-6">
          <!-- Personal Information Section -->
          <section class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">Personal Information</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="field in personalInfo" :key="field.key" class="relative">
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <button 
                    v-if="!field.readonly"
                    type="button" 
                    @click="toggleEdit(field.key)" 
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {{ formState.editableFields[field.key] ? 'Lock' : 'Edit' }}
                  </button>
                </div>
                
                <select
                  v-if="field.type === 'select'"
                  v-model="updatedStudent[field.key]"
                  :disabled="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                  :required="field.required"
                >
                  <option value="">Select {{ field.label }}</option>
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                
                <input
                  v-else
                  v-model="updatedStudent[field.key]"
                  :type="field.type"
                  :readonly="!formState.editableFields[field.key] || field.readonly"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm disabled:bg-gray-100"
                  :class="{'bg-gray-100': !formState.editableFields[field.key] || field.readonly}"
                  :required="field.required"
                />
              </div>
            </div>
          </section>

          <!-- Academic Information Section -->
          <section class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">Academic Information</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="field in academicInfo" :key="field.key" class="relative">
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    @click="toggleEdit(field.key)" 
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {{ formState.editableFields[field.key] ? 'Lock' : 'Edit' }}
                  </button>
                </div>
                
                <select
                  v-if="field.type === 'select'"
                  v-model="updatedStudent[field.key]"
                  :disabled="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                  :required="field.required"
                >
                  <option value="">Select {{ field.label }}</option>
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                
                <input
                  v-else
                  v-model="updatedStudent[field.key]"
                  :type="field.type"
                  :readonly="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm disabled:bg-gray-100"
                  :class="{'bg-gray-100': !formState.editableFields[field.key]}"
                  :required="field.required"
                />
              </div>
            </div>
          </section>

          <!-- Contact Information Section -->
          <section class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">Contact Information</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="field in contactInfo" :key="field.key" class="relative">
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    @click="toggleEdit(field.key)" 
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {{ formState.editableFields[field.key] ? 'Lock' : 'Edit' }}
                  </button>
                </div>
                
                <input
                  v-model="updatedStudent[field.key]"
                  :type="field.type"
                  :readonly="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm disabled:bg-gray-100"
                  :class="{'bg-gray-100': !formState.editableFields[field.key]}"
                  :required="field.required"
                />
              </div>
            </div>
          </section>

          <!-- Family Information Section -->
          <section class="bg-gray-50 p-4 rounded-lg mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">Family Information</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="field in familyInfo" :key="field.key" class="relative">
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    @click="toggleEdit(field.key)" 
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {{ formState.editableFields[field.key] ? 'Lock' : 'Edit' }}
                  </button>
                </div>
                
                <input
                  v-model="updatedStudent[field.key]"
                  type="text"
                  :readonly="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm disabled:bg-gray-100"
                  :class="{'bg-gray-100': !formState.editableFields[field.key]}"
                  :required="field.required"
                />
              </div>
            </div>
          </section>

          <!-- Privacy Settings Section -->
          <section class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">Privacy Settings</h3>
            </div>
            <div class="grid grid-cols-1 gap-6">
              <div v-for="field in privacyInfo" :key="field.key" class="relative">
                <div class="flex justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    @click="toggleEdit(field.key)" 
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {{ formState.editableFields[field.key] ? 'Lock' : 'Edit' }}
                  </button>
                </div>
                
                <select
                  v-model="updatedStudent[field.key]"
                  :disabled="!formState.editableFields[field.key]"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                  :required="field.required"
                >
                  <option value="">Select option</option>
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white p-4 border-t border-gray-200 flex justify-end gap-4 w-full">
          <button
            type="button"
            @click="$emit('cancel')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="formState.isSubmitting"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <svg v-if="formState.isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ formState.isSubmitting ? 'Updating...' : 'Update Student' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>