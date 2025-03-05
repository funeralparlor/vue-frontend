<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import { utils as xlsxUtils, writeFile as writeXLSXFile } from 'xlsx';
import MainLayout from '@/components/MainLayout.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ChevronDownIcon, XCircleIcon, CheckIcon } from '@heroicons/vue/24/outline';


// Reactive state
const filterSemester = ref([]);
const filterCourse = ref([]);
const filterCampus = ref([]);
const filterScholarshipType = ref([]);
const dropdownStates = ref({
  semester: false,
  course: false,
  campus: false,
  scholarshipType: false,
});

const selectedCountLabels = computed(() => ({
  semester: filterSemester.value.length ? `${filterSemester.value.length} selected` : 'All Semesters',
  course: filterCourse.value.length ? `${filterCourse.value.length} selected` : 'All Courses',
  campus: filterCampus.value.length ? `${filterCampus.value.length} selected` : 'All Campuses',
  scholarshipType: filterScholarshipType.value.length ? `${filterScholarshipType.value.length} selected` : 'All Scholarship Types',
}));

const students = ref([]);
const error = ref(null);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);




///drop down
const toggleDropdown = (filterType) => {
  dropdownStates.value[filterType] = !dropdownStates.value[filterType];
};

const toggleFilter = (filterType, value) => {
  const filterRef = {
    semester: filterSemester,
    course: filterCourse,
    campus: filterCampus,
    scholarshipType: filterScholarshipType,
  }[filterType];

  if (filterRef.value.includes(value)) {
    filterRef.value = filterRef.value.filter((item) => item !== value);
  } else {
    filterRef.value.push(value);
  }
};

const removeFilter = (filterType, value) => {
  const filterRef = {
    semester: filterSemester,
    course: filterCourse,
    campus: filterCampus,
    scholarshipType: filterScholarshipType,
  }[filterType];

  filterRef.value = filterRef.value.filter((item) => item !== value);
};

const clearFilters = () => {
  filterSemester.value = [];
  filterCourse.value = [];
  filterCampus.value = [];
  filterScholarshipType.value = [];
  searchQuery.value = '';
  currentPage.value = 1;
};


// User and navigation data
const user = {
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'Add Student', href: '/home', icon: 'Users' },
  { name: 'Student List', href: '/list', icon: 'Folder', current: true },
  { name: '', href: '#', icon: 'Calendar' },
  { name: '', href: '#', icon: 'ChartBar' },
];

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

// Computed properties
const filterOptions = computed(() => ({
  semester: [...new Set(students.value.map(s => s.semester))].sort(),
  course: [...new Set(students.value.map(s => s.course))].sort(),
  campus: [...new Set(students.value.map(s => s.campus))].sort(),
  scholarshipType: [...new Set(students.value.map(s => s.scholarship_type))].sort(),
}));

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesFilters = (
      (filterSemester.value.length === 0 || filterSemester.value.includes(student.semester)) &&
      (filterCourse.value.length === 0 || filterCourse.value.includes(student.course)) &&
      (filterCampus.value.length === 0 || filterCampus.value.includes(student.campus)) &&
      (filterScholarshipType.value.length === 0 || filterScholarshipType.value.includes(student.scholarship_type))
    );

    const matchesSearch = searchQuery.value
      ? student.student_id.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true;

    return matchesFilters && matchesSearch;
  });
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudents.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredStudents.value.length / itemsPerPage.value));
});

// Actions


const loadStudents = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await api.get('/students');
    students.value = response.data;
  } catch (err) {
    error.value = 'Failed to load students. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Define filter refs mapping for dynamic binding
const filterRefs = {
  semester: filterSemester,
  course: filterCourse,
  campus: filterCampus,
  scholarshipType: filterScholarshipType
};


// Enhanced Excel Export
const exportToExcel = () => {
  const data = filteredStudents.value.map(student => ({
    'Student ID': student.student_id,
    'Last Name': student.last_name,
    'First Name': student.first_name,
    'Middle Name': student.middle_name || '-',
    'Semester': student.semester,
    'Course': student.course,
    'Campus': student.campus,
    'Scholarship Type': student.scholarship_type
  }));

  const worksheet = xlsxUtils.json_to_sheet(data);
  const workbook = xlsxUtils.book_new();
  
  // Add header style
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E3A8A" } }, // Dark blue
    border: { bottom: { style: "medium", color: { rgb: "000000" } } }
  };

  // Apply styles to header row
  const range = xlsxUtils.decode_range(worksheet['!ref']);
  for(let C = range.s.c; C <= range.e.c; C++) {
    const cell = xlsxUtils.encode_cell({ c: C, r: 0 });
    worksheet[cell].s = headerStyle;
  }

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 10 }, { wch: 25 },
    { wch: 20 }, { wch: 20 }
  ];

  // Add metadata and freeze header row
  worksheet['!autofilter'] = { ref: worksheet['!ref'] };
  worksheet['!freeze'] = { ySplit: 1 };
  
  xlsxUtils.book_append_sheet(workbook, worksheet, 'Students');
  writeXLSXFile(workbook, `students_export_${new Date().toISOString()}.xlsx`);
};

// Enhanced PDF Export
const exportToPDF = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add header section
  const logo = new Image();
  logo.src = user.imageUrl;
  doc.addImage(logo, 'PNG', 15, 10, 15, 15);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BulSU Student List Export', 35, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exported: ${new Date().toLocaleString()}`, 15, 30);

  // Filter information
  const filters = [
  filterSemester.value.length > 0 && `Semester: ${filterSemester.value.join(', ')}`,
  filterCourse.value.length > 0 && `Course: ${filterCourse.value.join(', ')}`,
  filterCampus.value.length > 0 && `Campus: ${filterCampus.value.join(', ')}`,
  filterScholarshipType.value.length > 0 && `Scholarship: ${filterScholarshipType.value.join(', ')}`,
  searchQuery.value && `Search: ${searchQuery.value}`
].filter(Boolean).join('  •  ');

  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text(filters, 15, 38);

  // Table configuration
  const headers = [
    'Student ID',
    'Last Name',
    'First Name',
    'Middle Name',
    'Semester',
    'Course',
    'Campus',
    'Scholarship Type'
  ].map(h => ({
    title: h,
    dataKey: h,
    halign: 'center'
  }));

  const data = filteredStudents.value.map(student => ({
    ...student,
    'Student ID': student.student_id || '-',
    'Last Name': student.last_name || '-',
    'First Name': student.first_name || '-',
    'Middle Name': student.middle_name || '-',
    'Semester': student.semester || '-',
    'Course': student.course || '-',
    'Campus': student.campus || '-',
    'Scholarship Type': student.scholarship_type || '-'
  }));

  // Generate table
  doc.autoTable({
    head: [headers.map(h => h.title)],
    body: data.map(row => headers.map(h => row[h.dataKey])),
    startY: 45,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 1.5,
      font: 'helvetica',
      valign: 'middle',
      textColor: [31, 41, 55] // gray-800
    },
    headStyles: {
      fillColor: [30, 58, 138], // blue-900
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246] // gray-50
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 40 },
      6: { cellWidth: 35 },
      7: { cellWidth: 35 }
    },
    margin: { left: 15, right: 15 }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount} - BulSU Student Records`,
      105, 
      200,
      { align: 'center' }
    );
  }

  doc.save(`students_export_${new Date().toISOString()}.pdf`);
};

// Add to onMounted or loadStudents
const preloadLogo = () => {
  const img = new Image();
  img.src = user.imageUrl;
};
onMounted(() => {
  loadStudents();
  preloadLogo();
});
</script>

<template>
 <MainLayout pageTitle="Student List">
   
      <!-- Content area -->
      <div class="flex flex-col gap-8">
        <!-- Header and filters -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button 
          @click="exportToExcel"
          class="btn-export flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
        >
          <span class="hidden sm:inline">Export Excel</span>
          <DocumentArrowDownIcon class="h-5 w-5" />
        </button>
        <button 
          @click="exportToPDF"
          class="btn-export flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <span class="hidden sm:inline">Export PDF</span>
          <DocumentTextIcon class="h-5 w-5" />
        </button>
      </div>
      <button 
        @click="loadStudents"
        class="btn-refresh flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowPathIcon class="h-4 w-4" />
        Refresh Data
      </button>
    </div>
  </div>



  

          <!-- Filter controls -->
<div class="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
  <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
    <!-- Search by Student ID -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Search by Student ID</label>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Enter Student ID"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-10"
        />
        <MagnifyingGlassIcon class="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
      </div>
    </div>

             

           


            <!-- Multi-select dropdown for Semester -->
    <div class="filter-dropdown-container relative">
      <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
      <button 
        @click.stop="toggleDropdown('semester')"
        class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span class="truncate">{{ selectedCountLabels.semester }}</span>
        <ChevronDownIcon class="h-4 w-4 text-gray-400" />
      </button>
      <div 
        v-if="dropdownStates.semester"
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
      >
        <div class="p-2 border-b">
          <div class="mb-2 text-xs text-gray-500">
            {{ filterSemester.length }} of {{ filterOptions.semester.length }} selected
          </div>
          <div class="flex flex-wrap gap-1 mt-1">
            <div 
              v-for="value in filterSemester" 
              :key="value"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{{ value }}</span>
              <button @click.stop="removeFilter('semester', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div 
          v-for="option in filterOptions.semester" 
          :key="option"
          @click.stop="toggleFilter('semester', option)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
        >
          <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterSemester.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
            <CheckIcon v-if="filterSemester.includes(option)" class="h-3 w-3 text-white" />
          </div>
          <span>{{ option }}</span>
        </div>
      </div>
    </div>

    <!-- Multi-select dropdown for Course -->
    <div class="filter-dropdown-container relative">
      <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
      <button 
        @click.stop="toggleDropdown('course')"
        class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span class="truncate">{{ selectedCountLabels.course }}</span>
        <ChevronDownIcon class="h-4 w-4 text-gray-400" />
      </button>
      <div 
        v-if="dropdownStates.course"
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
      >
        <div class="p-2 border-b">
          <div class="mb-2 text-xs text-gray-500">
            {{ filterCourse.length }} of {{ filterOptions.course.length }} selected
          </div>
          <div class="flex flex-wrap gap-1 mt-1">
            <div 
              v-for="value in filterCourse" 
              :key="value"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{{ value }}</span>
              <button @click.stop="removeFilter('course', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div 
          v-for="option in filterOptions.course" 
          :key="option"
          @click.stop="toggleFilter('course', option)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
        >
          <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterCourse.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
            <CheckIcon v-if="filterCourse.includes(option)" class="h-3 w-3 text-white" />
          </div>
          <span>{{ option }}</span>
        </div>
      </div>
    </div>

    <!-- Multi-select dropdown for Campus -->
    <div class="filter-dropdown-container relative">
      <label class="block text-sm font-medium text-gray-700 mb-2">Campus</label>
      <button 
        @click.stop="toggleDropdown('campus')"
        class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span class="truncate">{{ selectedCountLabels.campus }}</span>
        <ChevronDownIcon class="h-4 w-4 text-gray-400" />
      </button>
      <div 
        v-if="dropdownStates.campus"
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
      >
        <div class="p-2 border-b">
          <div class="mb-2 text-xs text-gray-500">
            {{ filterCampus.length }} of {{ filterOptions.campus.length }} selected
          </div>
          <div class="flex flex-wrap gap-1 mt-1">
            <div 
              v-for="value in filterCampus" 
              :key="value"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{{ value }}</span>
              <button @click.stop="removeFilter('campus', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div 
          v-for="option in filterOptions.campus" 
          :key="option"
          @click.stop="toggleFilter('campus', option)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
        >
          <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterCampus.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
            <CheckIcon v-if="filterCampus.includes(option)" class="h-3 w-3 text-white" />
          </div>
          <span>{{ option }}</span>
        </div>
      </div>
    </div>

    <!-- Multi-select dropdown for Scholarship Type -->
    <div class="filter-dropdown-container relative">
      <label class="block text-sm font-medium text-gray-700 mb-2">Scholarship Type</label>
      <button 
        @click.stop="toggleDropdown('scholarshipType')"
        class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span class="truncate">{{ selectedCountLabels.scholarshipType }}</span>
        <ChevronDownIcon class="h-4 w-4 text-gray-400" />
      </button>
      <div 
        v-if="dropdownStates.scholarshipType"
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
      >
        <div class="p-2 border-b">
          <div class="mb-2 text-xs text-gray-500">
            {{ filterScholarshipType.length }} of {{ filterOptions.scholarshipType.length }} selected
          </div>
          <div class="flex flex-wrap gap-1 mt-1">
            <div 
              v-for="value in filterScholarshipType" 
              :key="value"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{{ value }}</span>
              <button @click.stop="removeFilter('scholarshipType', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div 
          v-for="option in filterOptions.scholarshipType" 
          :key="option"
          @click.stop="toggleFilter('scholarshipType', option)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
        >
          <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterScholarshipType.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
            <CheckIcon v-if="filterScholarshipType.includes(option)" class="h-3 w-3 text-white" />
          </div>
          <span>{{ option }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Active filter tags -->
  <div v-if="filterSemester.length || filterCourse.length || filterCampus.length || filterScholarshipType.length" class="mt-4">
    <h3 class="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="value in filterSemester" 
        :key="`sem-${value}`"
        class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
      >
        <span>Semester: {{ value }}</span>
        <button @click="removeFilter('semester', value)" class="ml-1 text-blue-600 hover:text-blue-800">
          <XCircleIcon class="h-3 w-3" />
        </button>
      </div>
      <div 
        v-for="value in filterCourse" 
        :key="`course-${value}`"
        class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
      >
        <span>Course: {{ value }}</span>
        <button @click="removeFilter('course', value)" class="ml-1 text-blue-600 hover:text-blue-800">
          <XCircleIcon class="h-3 w-3" />
        </button>
      </div>
      <div 
        v-for="value in filterCampus" 
        :key="`campus-${value}`"
        class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
      >
        <span>Campus: {{ value }}</span>
        <button @click="removeFilter('campus', value)" class="ml-1 text-blue-600 hover:text-blue-800">
          <XCircleIcon class="h-3 w-3" />
        </button>
      </div>
      <div 
        v-for="value in filterScholarshipType" 
        :key="`schol-${value}`"
        class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
      >
        <span>Scholarship: {{ value }}</span>
        <button @click="removeFilter('scholarshipType', value)" class="ml-1 text-blue-600 hover:text-blue-800">
          <XCircleIcon class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>

  <div class="mt-4 flex justify-between items-center">
    <span class="text-sm text-gray-500">
      Showing {{ filteredStudents.length }} results
    </span>
    <button 
      @click="clearFilters"
      class="btn-clear flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
    >
      <XMarkIcon class="h-4 w-4" />
      Clear Filters
    </button>



            
            </div>
          </div>
        </div>

        <!-- Loading and error states -->
        <div v-if="isLoading" class="text-center p-8">
          <div class="h-8 w-8 text-blue-600 mx-auto animate-spin">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          <p class="mt-2 text-sm text-gray-600">Loading students...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>

        <!-- Student table -->
        <div v-else class="bg-white rounded-lg shadow overflow-hidden ring-1 ring-gray-200">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="header in [
                    'Student ID', 'Last Name', 'First Name', 'Middle Name',
                    'Semester', 'Course', 'Campus', 'Scholarship Type'
                  ]" :key="header" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr 
                  v-for="student in paginatedStudents" 
                  :key="student.id" 
                  class="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ student.student_id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.first_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.middle_name || '—' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.semester }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.course }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ student.campus }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {{ student.scholarship_type }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!filteredStudents.length">
                  <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    No students found matching the criteria
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages || totalPages === 0"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
   

  </MainLayout>
</template>

<style scoped>
.btn-refresh {
  transition: color 0.2s ease;
}

.btn-clear {
  transition: color 0.2s ease;
}

.filter-select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.student-table {
  min-height: 300px;
}

/* Add export button styling */
.btn-export {
  transition: color 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: rgba(243, 244, 246, 0.5);
  border: 1px solid rgba(209, 213, 219, 0.3);
}

.btn-export:hover {
  background-color: rgba(229, 231, 235, 0.5);
}
.filter-dropdown-container {
  position: relative;
}

.filter-dropdown-container button {
  transition: all 0.2s ease;
}

.filter-dropdown-container button:hover {
  background-color: #f9fafb;
}

.filter-dropdown-container .dropdown {
  max-height: 224px; /* Adjust as needed */
  overflow-y: auto;
}

</style>