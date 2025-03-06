<script setup>
import { ref, computed, reactive, watch } from 'vue';
import api from '../services/api';

// Use reactive for complex objects
const student = reactive({
  student_id: '',
  last_name: '',
  first_name: '',
  middle_name: '',
  course: '',
  college: '',
  campus: '',
  year_level: '',
  gender: '',
  birthday: '',
  birth_place: '',
  comp_address: '',
  barangay: '',
  town: '',
  province: '',
  email: '',
  number: '',
  father_name: '',
  father_occup: '',
  mother_name: '',
  mother_occup: '',
  student_status: '',
  last_sem: '',
  section: '',
  approved: '',
  scholarship_type: ''
});

// Constants for form options
const SATELLITES = [
  { value: 'Main campus', label: 'Main campus' },
  { value: 'Bustos Campus', label: 'Bustos Campus' },
  { value: 'Sarmiento Campus', label: 'Sarmiento Campus' },
  { value: 'Meneses Campus', label: 'Meneses Campus' },
  { value: 'Consortium ', label: 'Consortium ' },
  { value: 'Hagonoy Campus', label: 'Hagonoy Campus' },
  { value: 'Pulilan Campus', label: 'Pulilan Campus' },
  { value: 'San Rafael Campus', label: 'San Rafael Campus' }
];

// Constants for form options
const COLLEGES = [
  { value: 'CAFA', label: 'College of Architecture and Fine Arts (CAFA)' },
  { value: 'CAL', label: 'College of Arts and Letters (CAL)' },
  { value: 'CBEA', label: 'College of Business Education and Accountancy (CBEA)' },
  { value: 'CCJE', label: 'College of Criminal Justice Education (CCJE)' },
  { value: 'CHTM', label: 'College of Hospitality and Tourism Management (CHTM)' },
  { value: 'CICT', label: 'College of Information and Communications Technology (CICT)' },
  { value: 'CIT', label: 'College of Industrial Technology (CIT)' },
  { value: 'CLaw', label: 'College of Law (CLaw)' },
  { value: 'CN', label: 'College of Nursing (CN)' },
  { value: 'COE', label: 'College of Engineering (COE)' },
  { value: 'COED', label: 'College of Education (COED)' },
  { value: 'CS', label: 'College of Science (CS)' },
  { value: 'CSER', label: 'College of Sports, Exercise and Recreation (CSER)' },
  { value: 'CSSP', label: 'College of Social Sciences and Philosophy (CSSP)' },
  { value: 'GS', label: 'Graduate School (GS)' }
];

// Courses organized by college
const COURSES_BY_COLLEGE = {
  'CAFA': [
    { value: 'Bachelor of Fine Arts Major in Visual Communication', label: 'Bachelor of Fine Arts Major in Visual Communication' },
    { value: 'Bachelor of Landscape Architecture', label: 'Bachelor of Landscape Architecture' },
    { value: 'Bachelor of Science in Architecture', label: 'Bachelor of Science in Architecture' }
    
  ],
  'CAL': [
    { value: 'Bachelor of Arts in Broadcasting', label: 'Bachelor of Arts in Broadcasting' },
    { value: 'Bachelor of Arts in Journalism', label: 'Bachelor of Arts in Journalism' },
     { value: 'Bachelor of Performing Arts (Theater Track)', label: 'Bachelor of Performing Arts (Theater Track)' },
    { value: 'Batsilyer ng Sining sa Malikhaing Pagsulat', label: 'Batsilyer ng Sining sa Malikhaing Pagsulat' }
  ],
  'CBEA': [
    { value: 'Bachelor of Science in Accountancy', label: 'Bachelor of Science in Accountancy' },
    { value: 'Bachelor of Science in Business Administration Major in Business Economics', label: 'Bachelor of Science in Business Administration Major in Business Economics' },
    { value: 'Bachelor of Science in Business Administration Major in Financial Management', label: 'Bachelor of Science in Business Administration Major in Financial Management' },
     { value: 'Bachelor of Science in Business Administration Major in Marketing Management', label: 'Bachelor of Science in Business Administration Major in Marketing Management' },
      { value: 'Bachelor of Science in Entrepreneurship', label: 'Bachelor of Science in Entrepreneurship' },
  ],
  'CCJE': [
    { value: 'Bachelor of Arts in Legal Management', label: 'Bachelor of Arts in Legal Management' },
    { value: 'Bachelor of Science in Criminology', label: 'Bachelor of Science in Criminology' }
  ],
  'CHTM': [
    { value: 'Bachelor of Science in Hospitality Management', label: 'Bachelor of Science in Hospitality Management' },
    { value: 'Bachelor of Science in Tourism Management', label: 'Bachelor of Science in Tourism Management' }
  ],
  'CICT': [
     { value: 'Bachelor of Library and Information Science', label: 'Bachelor of Library and Information Science' },
    { value: 'Bachelor of Science in Information System', label: 'Bachelor of Science in Information System' },
    { value: 'Bachelor of Science in Information Technology', label: 'Bachelor of Science in Information Technology' }
  ],
  'CIT': [
     { value: 'Bachelor of Industrial Technology with specialization in Automotive', label: 'Bachelor of Industrial Technology with specialization in Automotive' },
    { value: 'Bachelor of Industrial Technology with specialization in Computer', label: 'Bachelor of Industrial Technology with specialization in Computer' },
    { value: 'Bachelor of Industrial Technology with specialization in Drafting', label: 'Bachelor of Industrial Technology with specialization in Drafting' },
    { value: 'Bachelor of Industrial Technology with specialization in Electrical', label: 'Bachelor of Industrial Technology with specialization in Electrical' },
    { value: 'Bachelor of Industrial Technology with specialization in Electronics & Communication Technology', label: 'Bachelor of Industrial Technology with specialization in Electronics & Communication Technology' },
    { value: 'Bachelor of Industrial Technology with specialization in Electronics Technology', label: 'Bachelor of Industrial Technology with specialization in Electronics Technology' },
    { value: 'Bachelor of Industrial Technology with specialization in Food Processing Technology', label: 'Bachelor of Industrial Technology with specialization in Food Processing Technology' },
    { value: 'Bachelor of Industrial Technology with specialization in Heating, Ventilation, Air Conditioning and Refrigeration Technology (HVACR)', label: 'Bachelor of Industrial Technology with specialization in Heating, Ventilation, Air Conditioning and Refrigeration Technology (HVACR)' },
    { value: 'Bachelor of Industrial Technology with specialization in Mechanical', label: 'Bachelor of Industrial Technology with specialization in Mechanical' },
    { value: 'Bachelor of Industrial Technology with specialization in Mechatronics Technology', label: 'Bachelor of Industrial Technology with specialization in Mechatronics Technology' },
    { value: 'Bachelor of Industrial Technology with specialization in Welding Technology', label: 'Bachelor of Industrial Technology with specialization in Welding Technology' }
  ],
  'CLaw': [
     { value: 'Bachelor of Laws', label: 'Bachelor of Laws' },
    { value: 'Juris Doctor', label: 'Juris Doctor' }
  ],
  'CN': [
   { value: 'Bachelor of Science in Nursing', label: 'Bachelor of Science in Nursing' }
  ],
  'COE': [
    { value: 'Bachelor of Science in Civil Engineering', label: 'Bachelor of Science in Civil Engineering' },
    { value: 'Bachelor of Science in Computer Engineering', label: 'Bachelor of Science in Computer Engineering' },
    { value: 'Bachelor of Science in Electrical Engineering', label: 'Bachelor of Science in Electrical Engineering' },
    { value: 'Bachelor of Science in Electronics Engineering', label: 'Bachelor of Science in Electronics Engineering' },
    { value: 'Bachelor of Science in Industrial Engineering', label: 'Bachelor of Science in Industrial Engineering' },
    { value: 'Bachelor of Science in Manufacturing Engineering', label: 'Bachelor of Science in Manufacturing Engineering' },
    { value: 'Bachelor of Science in Mechanical Engineering', label: 'Bachelor of Science in Mechanical Engineering' },
    { value: 'Bachelor of Science in Mechatronics Engineering', label: 'Bachelor of Science in Mechatronics Engineering' }
  ],
  'COED': [
  { value: 'Bachelor of Early Childhood Education', label: 'Bachelor of Early Childhood Education' },
  { value: 'Bachelor of Elementary Education', label: 'Bachelor of Elementary Education' },
  { value: 'Bachelor of Physical Education', label: 'Bachelor of Physical Education' },
  { value: 'Bachelor of Secondary Education Major in English minor in Mandarin', label: 'Bachelor of Secondary Education Major in English minor in Mandarin' },
  { value: 'Bachelor of Secondary Education Major in Filipino', label: 'Bachelor of Secondary Education Major in Filipino' },
  { value: 'Bachelor of Secondary Education Major in Mathematics', label: 'Bachelor of Secondary Education Major in Mathematics' },
  { value: 'Bachelor of Secondary Education Major in Sciences', label: 'Bachelor of Secondary Education Major in Sciences' },
  { value: 'Bachelor of Secondary Education Major in Social Studies', label: 'Bachelor of Secondary Education Major in Social Studies' },
  { value: 'Bachelor of Secondary Education Major in Values Education', label: 'Bachelor of Secondary Education Major in Values Education' },
  { value: 'Bachelor of Technology and Livelihood Education Major in Home Economics', label: 'Bachelor of Technology and Livelihood Education Major in Home Economics' },
  { value: 'Bachelor of Technology and Livelihood Education Major in Industrial Arts', label: 'Bachelor of Technology and Livelihood Education Major in Industrial Arts' },
  { value: 'Bachelor of Technology and Livelihood Education Major in Information and Communication Technology', label: 'Bachelor of Technology and Livelihood Education Major in Information and Communication Technology' }
],

  'CS': [
  { value: 'Bachelor of Science in Biology', label: 'Bachelor of Science in Biology' },
  { value: 'Bachelor of Science in Environmental Science', label: 'Bachelor of Science in Environmental Science' },
  { value: 'Bachelor of Science in Food Technology', label: 'Bachelor of Science in Food Technology' },
  { value: 'Bachelor of Science in Math with Specialization in Applied Statistics', label: 'Bachelor of Science in Math with Specialization in Applied Statistics' },
  { value: 'Bachelor of Science in Math with Specialization in Business Applications', label: 'Bachelor of Science in Math with Specialization in Business Applications' },
  { value: 'Bachelor of Science in Math with Specialization in Computer Science', label: 'Bachelor of Science in Math with Specialization in Computer Science' }
],

  'CSER': [
  { value: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Coaching', label: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Coaching' },
  { value: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Management', label: 'Bachelor of Science in Exercise and Sports Sciences with specialization in Fitness and Sports Management' },
  { value: 'Certificate of Physical Education', label: 'Certificate of Physical Education' }
],

 'CSSP': [
  { value: 'Bachelor of Public Administration', label: 'Bachelor of Public Administration' },
  { value: 'Bachelor of Science in Psychology', label: 'Bachelor of Science in Psychology' },
  { value: 'Bachelor of Science in Social Work', label: 'Bachelor of Science in Social Work' }
],

  'GS': [
  { value: 'Doctor of Education', label: 'Doctor of Education' },
  { value: 'Doctor of Philosophy', label: 'Doctor of Philosophy' },
  { value: 'Doctor of Public Administration', label: 'Doctor of Public Administration' },
  { value: 'Master in Business Administration', label: 'Master in Business Administration' },
  { value: 'Master in Physical Education', label: 'Master in Physical Education' },
  { value: 'Master in Public Administration', label: 'Master in Public Administration' },
  { value: 'Master of Arts in Education', label: 'Master of Arts in Education' },
  { value: 'Master of Engineering Program', label: 'Master of Engineering Program' },
  { value: 'Master of Industrial Technology Management', label: 'Master of Industrial Technology Management' },
  { value: 'Master of Information Technology', label: 'Master of Information Technology' },
  { value: 'Master of Manufacturing Engineering', label: 'Master of Manufacturing Engineering' },
  { value: 'Master of Science in Civil Engineering', label: 'Master of Science in Civil Engineering' },
  { value: 'Master of Science in Computer Engineering', label: 'Master of Science in Computer Engineering' },
  { value: 'Master of Science in Electronics and Communications Engineering', label: 'Master of Science in Electronics and Communications Engineering' }
],

};

// Constants for form options
const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' }
];



// Year levels
const YEAR_LEVELS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' }

];

// Form state
const error = ref(null);
const isLoading = ref(false);
const successMessage = ref('');
const emit = defineEmits(['studentCreated', 'close', 'cancel']);

// File import state
const importFile = ref(null);
const importErrors = ref({});
const importSuccess = ref('');
const isImporting = ref(false);

// Available courses based on selected college
const availableCourses = computed(() => {
  if (!student.college) return [];
  return COURSES_BY_COLLEGE[student.college] || [];
});

// Reset course when college changes
watch(() => student.college, (newVal) => {
  if (newVal !== student.college) {
    student.course = '';
  }
});

// Centralized validation rules
const validationRules = {
  student_id: (value) => !!value?.trim() || 'Student ID is required',
  last_name: (value) => !!value?.trim() || 'Last Name is required',
  first_name: (value) => !!value?.trim() || 'First Name is required',
  college: (value) => !!value?.trim() || 'College is required',
  course: (value) => !!value?.trim() || 'Course is required',
  campus: (value) => !!value?.trim() || 'Campus is required',

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
    class="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50"
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="college" class="block text-sm font-medium text-gray-700 mb-1">College</label>
              <select
                id="college"
                v-model="student.college"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.college ? 'border-red-500' : 'border-gray-300',
                ]"
              >
                <option value="">Select College</option>
                <option v-for="option in COLLEGES" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="validationErrors.college" class="mt-1 text-sm text-red-600">
                {{ validationErrors.college }}
              </p>
            </div>
  
            <div>
              <label for="course" class="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                id="course"
                v-model="student.course"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.course ? 'border-red-500' : 'border-gray-300',
                ]"
                :disabled="!student.college"
              >
                <option value="">{{ student.college ? 'Select Course' : 'Select College First' }}</option>
                <option v-for="option in availableCourses" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="validationErrors.course" class="mt-1 text-sm text-red-600">
                {{ validationErrors.course }}
              </p>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="campus" class="block text-sm font-medium text-gray-700 mb-1">Campus</label>
              <select
                id="campus"
                v-model="student.campus"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.campus ? 'border-red-500' : 'border-gray-300',
                ]"
              >
                <option value="">Select Campus</option>
                <option v-for="option in SATELLITES" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="validationErrors.campus" class="mt-1 text-sm text-red-600">
                {{ validationErrors.campus }}
              </p>
            </div>
  
            <div>
              <label for="year_level" class="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
              <select
                id="year_level"
                v-model="student.year_level"
                class="block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Year Level</option>
                <option v-for="option in YEAR_LEVELS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
  
          <!-- Personal Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                v-model="student.gender"
                class="block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option v-for="option in GENDERS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
  
            <div>
              <label for="birthday" class="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
              <input
                id="birthday"
                v-model="student.birthday"
                type="date"
                class="block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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