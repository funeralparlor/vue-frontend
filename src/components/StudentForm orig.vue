<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';
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
  scholar_ship: ''
});

// Constants for form options
const SATELLITES = [
  { value: 'Main campus', label: 'Main campus' },
  { value: 'Bustos Campus', label: 'Bustos Campus' },
  { value: 'Sarmiento Campus', label: 'Sarmiento Campus' },
  { value: 'Meneses Campus', label: 'Meneses Campus' },
  { value: 'Hagonoy Campus', label: 'Hagonoy Campus' },
  { value: 'San Rafael Campus', label: 'San Rafael Campus' }
];

// Constants for form options COLLEGES
// Colleges state
const colleges = ref([]);
const isLoadingColleges = ref(false);
const collegeError = ref(null);

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
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year' }

];

// Student Status
const STUDENT_STATUS = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Irregular', label: 'Irregular' }

];
// student approval
const STUDENT_APPROVAL = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }

];

// Scholarships state
const scholarships = ref([]);
const isLoadingScholarships = ref(false);
const scholarshipError = ref(null);

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

// Template download state
const isGeneratingTemplate = ref(false);

// Required columns for import based on backend validation
const requiredColumns = [
  'STUDENT NUMBER', 'LAST NAME', 'GIVEN NAME', 'MIDDLE NAME', 'COURSE', 'COLLEGE', 
  'CAMPUS', 'YEAR LEVEL', 'GENDER', 'DATE OF BIRTH', 'PLACE OF BIRTH', 'COMPLETE ADDRESS',
  'BARANGAY', 'TOWN/CITY', 'Province', 'Email', 'MobileNo', 'FatherName',
  'Father_Occupation', 'MotherName', 'Mother_Occupation', 'Student_Status',
  'Last sem of enrolment for inactive', 'Section', 'Approved to share the information', 'Scholarship Type'
];

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

const validationRules = {
  student_id: (value) => !!value?.trim() || 'Student ID is required',
  last_name: (value) => !!value?.trim() || 'Last Name is required',
  first_name: (value) => !!value?.trim() || 'First Name is required',
  course: (value) => !!value?.trim() || 'Course is required',
  college: (value) => !!value?.trim() || 'College is required',
  campus: (value) => !!value?.trim() || 'Campus is required',
  year_level: (value) => !!value?.trim() || 'Year Level is required',
  gender: (value) => !!value?.trim() || 'Gender is required',
  birthday: (value) => !!value?.trim() || 'Birthday is required',
  birth_place: (value) => !!value?.trim() || 'Birth Place is required',
  comp_address: (value) => !!value?.trim() || 'Complete Address is required',
  barangay: (value) => !!value?.trim() || 'Barangay is required',
  town: (value) => !!value?.trim() || 'Town is required',
  province: (value) => !!value?.trim() || 'Province is required',
  email: (value) => {
    if (!value?.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  },
  number: (value) => {
    if (!value?.trim()) return 'Phone Number is required';
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(value) || 'Please enter a valid phone number';
  },
  father_name: (value) => !!value?.trim() || "Father's Name is required",
  father_occup: (value) => !!value?.trim() || "Father's Occupation is required",
  mother_name: (value) => !!value?.trim() || "Mother's Name is required",
  mother_occup: (value) => !!value?.trim() || "Mother's Occupation is required",
  student_status: (value) => !!value?.trim() || 'Student Status is required',
  section: (value) => !!value?.trim() || 'Section is required',
  approved: (value) => !!value?.trim() || 'Approval Status is required',
  scholar_ship: (value) => !!value?.trim() || 'Scholarship Type is required'
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

// Fetch scholarships from API
const fetchScholarships = async () => {
  isLoadingScholarships.value = true;
  scholarshipError.value = null;
  
  try {
    // Use the API endpoint for fetching all scholarships
    const response = await api.get('/scholarships-all');
    scholarships.value = response.data.map(scholarship => ({
      value: scholarship.name,
      label: scholarship.name,
      description: scholarship.description
    }));
  } catch (err) {
    console.error('Failed to load scholarships:', err);
    scholarshipError.value = 'Failed to load scholarships. Please refresh the page or contact support.';
  } finally {
    isLoadingScholarships.value = false;
  }
};

// Fetch colleges from API
const fetchColleges = async () => {
  isLoadingColleges.value = true;
  collegeError.value = null;

  try {
    // Use the API endpoint for fetching all colleges
    const response = await api.get('/colleges-all');
    colleges.value = response.data.map(college => ({
      value: college.name,
      label: college.name,
      description: college.description
    }));
  } catch (err) {
    console.error('Failed to load colleges:', err);
    collegeError.value = 'Failed to load colleges. Please refresh the page or contact support.';
  } finally {
    isLoadingColleges.value = false;
  }
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

// Generate Excel template for download
const generateTemplate = async () => {
  isGeneratingTemplate.value = true;
  
  try {
    // Make a request to download the template
    const response = await api.get('api/students/template', {
      responseType: 'blob', // Important for handling file downloads
    });
    
    // Create a blob URL for the downloaded file
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_import_template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = 'Failed to download template. Please try again.';
  } finally {
    isGeneratingTemplate.value = false;
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

// Load scholarships when component is mounted
onMounted(() => {
  fetchScholarships();
  fetchColleges();
});
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
          
          <!-- Template instruction and download button -->
          <div class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm">
            <p class="mb-2 text-blue-800">
              <strong>Note:</strong> Please use our Excel template to ensure your data is formatted correctly.
              The template contains all required columns with proper formatting.
            </p>
            <div class="flex items-center mt-2">
              <button
                @click="generateTemplate"
                :disabled="isGeneratingTemplate"
                class="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{{ isGeneratingTemplate ? 'Downloading...' : 'Download Template' }}</span>
              </button>
            </div>
          </div>
          
         
          
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
           <label for="province" class="block text-sm font-bold text-gray-700 mb-5">Student's Academic Information</label>
          <!-- Student ID Field -->
          <section class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
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
    :disabled="isLoadingColleges"
  >
    <option value="" disabled selected>Select College</option>
    <option v-for="option in colleges" :key="option.value" :value="option.value">
      {{ option.description || option.label }}
    </option>
  </select>
  <p v-if="validationErrors.college" class="mt-1 text-sm text-red-600">
    {{ validationErrors.college }}
  </p>
  <p v-if="collegeError" class="mt-1 text-sm text-red-600">
    {{ collegeError }}
  </p>
  <p v-if="isLoadingColleges" class="mt-1 text-xs text-gray-500">
    Loading colleges...
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
                <option value="" disabled selected>Select Course</option>
                <option v-for="option in availableCourses" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="validationErrors.course" class="mt-1 text-sm text-red-600">
                {{ validationErrors.course }}
              </p>
              <p v-if="!student.college" class="mt-1 text-xs text-gray-500">
                Please select a college first
              </p>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="" disabled selected>Select Campus</option>
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
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.year_level ? 'border-red-500' : 'border-gray-300',
                ]"
              >
                <option value="" disabled selected>Select Year Level</option>
                <option v-for="option in YEAR_LEVELS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="validationErrors.year_level" class="mt-1 text-sm text-red-600">
              {{ validationErrors.year_level }}
            </p>
            </div>
  
            <div>
              <label for="section" class="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                id="section"
                v-model="student.section"
                type="text"
                :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.section ? 'border-red-500' : 'border-gray-300',
                ]"
                placeholder="Enter section"
              />
              <p v-if="validationErrors.section" class="mt-1 text-sm text-red-600">
              {{ validationErrors.section }}
            </p>
            </div>
            
          </div>
          
          </section>
          
          <!-- Personal Information -->
          <section class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <label for="personal-info" class="block text-sm font-bold text-gray-700 mb-5">Student's Personal Information</label>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  id="gender"
                  v-model="student.gender"
                  :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.gender ? 'border-red-500' : 'border-gray-300',
                ]"
                >
                  <option value="" disabled selected>Select Gender</option>
                  <option v-for="option in GENDERS" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="validationErrors.gender" class="mt-1 text-sm text-red-600">
              {{ validationErrors.gender }}
            </p>
              </div>
    
              <div>
                <label for="birthday" class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  id="birthday"
                  v-model="student.birthday"
                  type="date"
:class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.birthday ? 'border-red-500' : 'border-gray-300',
                ]"                />
                <p v-if="validationErrors.birthday" class="mt-1 text-sm text-red-600">
              {{ validationErrors.birthday }}
            </p>
              </div>
    
              <div>
                <label for="birth_place" class="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                <input
                  id="birth_place"
                  v-model="student.birth_place"
                  type="text"
                  :class="[
                  'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  validationErrors.birth_place ? 'border-red-500' : 'border-gray-300',
                ]"   
                  placeholder="Enter place of birth"
                />
                <p v-if="validationErrors.birth_place" class="mt-1 text-sm text-red-600">
              {{ validationErrors.birth_place }}
            </p>
              </div>
              
            </div>
            
            <!-- Contact Information -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
    <input
      id="email"
      v-model="student.email"
      type="email"
      :class="[
        'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        validationErrors.email ? 'border-red-500' : 'border-gray-300',
      ]"
      placeholder="Enter email address"
    />
    <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
      {{ validationErrors.email }}
    </p>
  </div>

  <div>
    <label for="number" class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
    <input
      id="number"
      v-model="student.number"
      type="tel"
      :class="[
        'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        validationErrors.number ? 'border-red-500' : 'border-gray-300',
      ]"
      placeholder="Enter mobile number"
    />
    <p v-if="validationErrors.number" class="mt-1 text-sm text-red-600">
      {{ validationErrors.number }}
    </p>
  </div>
</div>
    
            <!-- Address Information -->
<div class="mt-4">
  <label for="comp_address" class="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
  <textarea
    id="comp_address"
    v-model="student.comp_address"
    rows="2"
    :class="[
      'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      validationErrors.comp_address ? 'border-red-500' : 'border-gray-300',
    ]"
    placeholder="Enter complete address"
  ></textarea>
  <p v-if="validationErrors.comp_address" class="mt-1 text-sm text-red-600">
    {{ validationErrors.comp_address }}
  </p>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <div>
    <label for="barangay" class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
    <input
      id="barangay"
      v-model="student.barangay"
      type="text"
      :class="[
        'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        validationErrors.barangay ? 'border-red-500' : 'border-gray-300',
      ]"
      placeholder="Enter barangay"
    />
    <p v-if="validationErrors.barangay" class="mt-1 text-sm text-red-600">
      {{ validationErrors.barangay }}
    </p>
  </div>

  <div>
    <label for="town" class="block text-sm font-medium text-gray-700 mb-1">Town/City</label>
    <input
      id="town"
      v-model="student.town"
      type="text"
      :class="[
        'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        validationErrors.town ? 'border-red-500' : 'border-gray-300',
      ]"
      placeholder="Enter town/city"
    />
    <p v-if="validationErrors.town" class="mt-1 text-sm text-red-600">
      {{ validationErrors.town }}
    </p>
  </div>

  <div>
    <label for="province" class="block text-sm font-medium text-gray-700 mb-1">Province</label>
    <input
      id="province"
      v-model="student.province"
      type="text"
      :class="[
        'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        validationErrors.province ? 'border-red-500' : 'border-gray-300',
      ]"
      placeholder="Enter province"
    />
    <p v-if="validationErrors.province" class="mt-1 text-sm text-red-600">
      {{ validationErrors.province }}
    </p>
  </div>
</div>

          </section>
          
          <!-- Family Information -->
<section class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="father_name" class="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
      <input
        id="father_name"
        v-model="student.father_name"
        type="text"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.father_name ? 'border-red-500' : 'border-gray-300',
        ]"
        placeholder="Enter father's name"
      />
      <p v-if="validationErrors.father_name" class="mt-1 text-sm text-red-600">
        {{ validationErrors.father_name }}
      </p>
    </div>

    <div>
      <label for="father_occup" class="block text-sm font-medium text-gray-700 mb-1">Father's Occupation</label>
      <input
        id="father_occup"
        v-model="student.father_occup"
        type="text"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.father_occup ? 'border-red-500' : 'border-gray-300',
        ]"
        placeholder="Enter father's occupation"
      />
      <p v-if="validationErrors.father_occup" class="mt-1 text-sm text-red-600">
        {{ validationErrors.father_occup }}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    <div>
      <label for="mother_name" class="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
      <input
        id="mother_name"
        v-model="student.mother_name"
        type="text"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.mother_name ? 'border-red-500' : 'border-gray-300',
        ]"
        placeholder="Enter mother's name"
      />
      <p v-if="validationErrors.mother_name" class="mt-1 text-sm text-red-600">
        {{ validationErrors.mother_name }}
      </p>
    </div>

    <div>
      <label for="mother_occup" class="block text-sm font-medium text-gray-700 mb-1">Mother's Occupation</label>
      <input
        id="mother_occup"
        v-model="student.mother_occup"
        type="text"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.mother_occup ? 'border-red-500' : 'border-gray-300',
        ]"
        placeholder="Enter mother's occupation"
      />
      <p v-if="validationErrors.mother_occup" class="mt-1 text-sm text-red-600">
        {{ validationErrors.mother_occup }}
      </p>
    </div>
  </div>
</section>
          
          <!-- Additional Information -->
<section class="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="student_status" class="block text-sm font-medium text-gray-700 mb-1">Student Status</label>
      <select
        id="student_status"
        v-model="student.student_status"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.student_status ? 'border-red-500' : 'border-gray-300',
        ]"
      >
        <option value="" disabled selected>Select Status</option>
        <option v-for="option in STUDENT_STATUS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="validationErrors.student_status" class="mt-1 text-sm text-red-600">
        {{ validationErrors.student_status }}
      </p>
    </div>

    <div>
              <label for="last_sem" class="block text-sm font-medium text-gray-700 mb-1">Last Semester</label>
              <input
                id="last_sem"
                v-model="student.last_sem"
                type="text"
                class="block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(optional)"
              />
            </div>
    
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    <div>
      <label for="approved" class="block text-sm font-medium text-gray-700 mb-1">Approved to Share Information</label>
      <select
        id="approved"
        v-model="student.approved"
        :class="[
          'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          validationErrors.approved ? 'border-red-500' : 'border-gray-300',
        ]"
      >
        <option value="" disabled selected>Select Option</option>
        <option v-for="option in STUDENT_APPROVAL" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="validationErrors.approved" class="mt-1 text-sm text-red-600">
        {{ validationErrors.approved }}
      </p>
    </div>

    
              <div>
  <label for="scholar_ship" class="block text-sm font-medium text-gray-700 mb-1">Scholarship Type</label>
  <select
    id="scholar_ship"
    v-model="student.scholar_ship"
    :class="[
      'block w-full rounded-md border p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      validationErrors.scholar_ship ? 'border-red-500' : 'border-gray-300',
    ]"
    :disabled="isLoadingScholarships"
  >
    <option value="" disabled selected>Select Scholarship Type</option>
    <option v-for="option in scholarships" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
  <p v-if="validationErrors.scholar_ship" class="mt-1 text-sm text-red-600">
    {{ validationErrors.scholar_ship }}
  </p>
  <p v-if="scholarshipError" class="mt-1 text-sm text-red-600">
    {{ scholarshipError }}
  </p>
  <p v-if="isLoadingScholarships" class="mt-1 text-xs text-gray-500">
    Loading scholarships...
  </p>
</div>
  </div>
</section>
  
          <!-- Error and Success Messages -->
          <div v-if="error" class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="ml-3 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
  
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4 border border-green-200">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="ml-3 text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
  
          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Saving...</span>
              <span v-else>Save Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>