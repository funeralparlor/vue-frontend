<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import { utils as xlsxUtils, writeFile as writeXLSXFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


// Reactive state
const filterSemester = ref('');
const filterCourse = ref('');
const filterCampus = ref('');
const filterScholarshipType = ref('');

const students = ref([]);
const error = ref(null);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// User and navigation data
const user = {
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
};

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'Home' },
  { name: 'Student List', href: '/list', icon: 'Users', current: true },
  { name: '', href: '#', icon: 'Folder' },
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
      (!filterSemester.value || student.semester === filterSemester.value) &&
      (!filterCourse.value || student.course === filterCourse.value) &&
      (!filterCampus.value || student.campus === filterCampus.value) &&
      (!filterScholarshipType.value || student.scholarship_type === filterScholarshipType.value)
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
const clearFilters = () => {
  filterSemester.value = '';
  filterCourse.value = '';
  filterCampus.value = '';
  filterScholarshipType.value = '';
  searchQuery.value = '';
  currentPage.value = 1;
};

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
    filterSemester.value && `Semester: ${filterSemester.value}`,
    filterCourse.value && `Course: ${filterCourse.value}`,
    filterCampus.value && `Campus: ${filterCampus.value}`,
    filterScholarshipType.value && `Scholarship: ${filterScholarshipType.value}`,
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
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar -->
    <Disclosure as="nav" class="lg:hidden bg-gray-900" v-slot="{ open }">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <DisclosureButton class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
              <span class="absolute -inset-0.5" />
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
          <div class="flex items-center">
            <Menu as="div" class="relative ml-3">
              <MenuButton class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <img class="h-8 w-8 rounded-full" :src="user.imageUrl" alt="" />
              </MenuButton>
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                  <a :href="item.href" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    {{ item.name }}
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel class="lg:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium']">
            {{ item.name }}
          </DisclosureButton>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <!-- Desktop sidebar -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
      <!-- Sidebar content -->
      <div class="flex h-16 shrink-0 items-center px-6 gap-4">
        <img class="h-8 w-8 rounded-full" :src="user.imageUrl" alt="Profile" />
        <div>
          <p class="text-sm font-medium text-white">BulSU</p>
          <span class="text-xs text-blue-400">Admin</span>
        </div>
      </div>
      <nav class="mt-6 px-4">
        <div class="space-y-4">
          <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', 'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6']">
            {{ item.name }}
          </a>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <main class="lg:pl-72">
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div class="flex flex-1 justify-end gap-x-4">
          <Menu as="div" class="relative">
            <MenuButton class="-m-1.5 flex items-center p-1.5">
              <span class="sr-only">Open user menu</span>
              <img class="h-8 w-8 rounded-full bg-gray-50" :src="user.imageUrl" alt="" />
              <span class="hidden lg:flex lg:items-center">
                <span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">{{ user.name }}</span>
              </span>
            </MenuButton>
            <MenuItems class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                <a :href="item.href" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">
                  {{ item.name }}
                </a>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <!-- Content area -->
      <div class="p-8">
        <!-- Header and filters -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Student List</h1>
    <div class="flex items-center gap-4">
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

              <!-- Fix for the filters -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select 
                  v-model="filterSemester"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Semesters</option>
                  <option v-for="option in filterOptions.semester" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select 
                  v-model="filterCourse"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Courses</option>
                  <option v-for="option in filterOptions.course" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Campus</label>
                <select 
                  v-model="filterCampus"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Campuses</option>
                  <option v-for="option in filterOptions.campus" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Scholarship Type</label>
                <select 
                  v-model="filterScholarshipType"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Scholarship Types</option>
                  <option v-for="option in filterOptions.scholarshipType" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
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
    </main>
  </div>
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
</style>