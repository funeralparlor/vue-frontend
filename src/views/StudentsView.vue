<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import api from '../services/api';
import EditStudentForm from '@/components/EditStudentForm.vue';
import StudentForm from '@/components/StudentForm.vue';
import MainLayout from '@/components/MainLayout.vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

// Reactive state
const students = ref([]);
const error = ref(null);
const editingStudent = ref(null);
const isAddModalOpen = ref(false);
const isLoading = ref(false);
const deletingId = ref(null);
const abortController = ref(new AbortController());
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(0);
const totalStudents = ref(0);
const selectedStudents = ref(new Set());
const availablePageSizes = ref([10, 25, 50, 100]);
const isLoadingAll = ref(false);
const allStudents = ref([]);

// Search functionality
const searchQuery = ref('');
const isSearching = ref(false);
const searchResults = ref([]);
const showSearchResults = computed(() => searchQuery.value.trim() !== '');

// Computed properties
const hasSelections = computed(() => selectedStudents.value.size > 0);
const allSelected = computed(() => {
  return students.value && students.value.length > 0 && 
         selectedStudents.value.size === students.value.length;
});
const isShowingAll = computed(() => itemsPerPage.value === 'All');

// Watch for changes to students and reset selections if needed
watch(students, () => {
  // If students data changes, reset selectedStudents
  selectedStudents.value.clear();
});

const displayedStudents = computed(() => {
  return showSearchResults.value ? searchResults.value : students.value;
});

// Handle search input with debounce
let searchTimeout = null;
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim() !== '') {
      searchStudents();
    } else {
      searchResults.value = [];
    }
  }, 300); // 300ms debounce
};

// Search students
const searchStudents = async () => {
  if (!searchQuery.value.trim()) return;
  
  try {
    isSearching.value = true;
    error.value = null;
    
    // Call search endpoint
    const response = await api.get('/api/students/search', {
      params: {
        student_id: searchQuery.value.trim()
      },
      signal: abortController.value.signal
    });
    
    if (response.data) {
   
      if (response.data.data && Array.isArray(response.data.data)) {
        searchResults.value = response.data.data;
      } else {
        searchResults.value = [];
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Search students error:', err);
      error.value = 'Failed to search students';
    }
  } finally {
    isSearching.value = false;
  }
};
// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

// Fetch students with pagination
const loadStudents = async () => {
  try {
    isLoading.value = true;
    error.value = null; // Clear any previous errors
    
    // Handle "All" option differently - use a reasonable page size
    const limit = itemsPerPage.value === 'All' ? 100 : itemsPerPage.value;
    
    const response = await api.get('/students', {
      params: {
        page: currentPage.value,
        limit: limit
      },
      signal: abortController.value.signal
    });
    // Handle different API response structures more consistently
    if (response.data) {
      // If the API returns data in a nested structure
      if (response.data.data && Array.isArray(response.data.data)) {
        students.value = response.data.data;
        totalStudents.value = response.data.total || 0;
        totalPages.value = Math.ceil(totalStudents.value / limit);
      } 
      // If the API returns data directly as an array
      else if (Array.isArray(response.data)) {
        students.value = response.data;
        totalStudents.value = response.data.length;
        totalPages.value = Math.ceil(totalStudents.value / limit);
      }
      
      // If showing "All", load all pages
      if (itemsPerPage.value === 'All' && totalPages.value > 1) {
        loadAllStudents(totalStudents.value, limit);
      }
      
      // Log the response structure for debugging
      console.log('API Response:', {
        structure: response.data,
        studentsCount: students.value.length,
        totalStudents: totalStudents.value,
        currentPage: currentPage.value,
        totalPages: totalPages.value
      });
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Load students error:', err);
      error.value = 'Failed to load students';
    }
  } finally {
    isLoading.value = false;
  }
};

// Load all students by fetching each page
const loadAllStudents = async (total, pageSize) => {
  try {
    isLoadingAll.value = true;
    allStudents.value = [...students.value]; // Start with the first page we already loaded
    
    const totalPagesToLoad = Math.ceil(total / pageSize);
    console.log(`Loading all ${total} students across ${totalPagesToLoad} pages`);
    
    // Load pages 2 to N (we already have page 1)
    for (let page = 2; page <= totalPagesToLoad; page++) {
      const response = await api.get('/students', {
        params: {
          page: page,
          limit: pageSize
        }
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        allStudents.value = [...allStudents.value, ...response.data.data];
      } else if (response.data && Array.isArray(response.data)) {
        allStudents.value = [...allStudents.value, ...response.data];
      }
      
      console.log(`Loaded page ${page}/${totalPagesToLoad}, total students so far: ${allStudents.value.length}`);
    }
    
    // When done loading all pages, replace the current students array
    students.value = allStudents.value;
    console.log(`All students loaded: ${students.value.length}`);
    
  } catch (err) {
    console.error('Load all students error:', err);
    error.value = 'Failed to load all students. Showing partial results.';
  } finally {
    isLoadingAll.value = false;
  }
};

// Pagination controls
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadStudents();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadStudents();
  }
};

// Handle page size change
const changePageSize = (size) => {
  itemsPerPage.value = size;
  currentPage.value = 1; // Reset to first page when changing page size
  selectedStudents.value = new Set(); // Clear selections when changing page size
  loadStudents();
};

// Selection management
const toggleStudentSelection = (id) => {
  if (!id) return; // Safeguard against undefined ids
  
  const newSelection = new Set(selectedStudents.value);
  newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
  selectedStudents.value = newSelection;
};

const toggleAllStudents = () => {
  if (!displayedStudents.value || displayedStudents.value.length === 0) return;
  
  if (!allSelected.value) {
    // Select all students
    const newSelection = new Set();
    displayedStudents.value.forEach(student => {
      if (student && student.id) newSelection.add(student.id);
    });
    selectedStudents.value = newSelection;
  } else {
    // Deselect all
    selectedStudents.value = new Set();
  }
};

// Bulk deletion
const deleteSelectedStudents = async () => {
  if (!hasSelections.value) return;
  
  const count = selectedStudents.value.size;
  if (!confirm(`Delete ${count} selected students?`)) return;
  
  try {
    isLoading.value = true;
    error.value = null;
    
    // Convert Set to Array
    const idsToDelete = Array.from(selectedStudents.value);
    console.log('Deleting students with IDs:', idsToDelete);
    
    // Use POST method instead of DELETE for bulk operations
    const response = await api.post('/students/bulk-delete', { 
      ids: idsToDelete 
    });
    
    console.log('Bulk delete response:', response);
    
    // Clear selections after successful deletion
    selectedStudents.value = new Set();
    
    // Handle page reset logic
    if (students.value.length === idsToDelete.length && currentPage.value > 1) {
      currentPage.value--;
    }
    
    // Reload students to refresh the list
    await loadStudents();
    
  } catch (err) {
    console.error('Bulk delete error:', err);
    error.value = `Failed to delete selected students: ${err.message || 'Unknown error'}`;
  } finally {
    isLoading.value = false;
  }
};

// Modal handlers
const closeAddModal = () => isAddModalOpen.value = false;
const closeEditModal = () => editingStudent.value = null;

// Handle student creation
const handleStudentCreated = async (newStudent) => {
  closeAddModal();
  // Reload the data instead of just pushing
  await loadStudents();
};

// Delete individual student
const deleteStudent = async (id) => {
  if (!id || !confirm('Are you sure you want to delete this student?')) return;
  
  try {
    deletingId.value = id;
    await api.delete(`/students/${id}`);
    
    // If in search mode, update search results
    if (showSearchResults.value) {
      searchResults.value = searchResults.value.filter(student => student.id !== id);
    }
    
    await loadStudents(); // Reload to maintain pagination state
  } catch (err) {
    console.error('Delete student error:', err);
    error.value = `Failed to delete student: ${err.message || 'Unknown error'}`;
  } finally {
    deletingId.value = null;
  }
};

// Handle student update
const handleUpdate = async (updatedStudent) => {
  closeEditModal();
  
  // If in search mode, update the result in the search results array
  if (showSearchResults.value) {
    const index = searchResults.value.findIndex(student => student.id === updatedStudent.id);
    if (index !== -1) {
      searchResults.value[index] = updatedStudent;
    }
  }
  
  // Reload data
  await loadStudents();
};

// Fetch student details for editing
const editStudent = async (id) => {
  if (!id) return;
  
  try {
    error.value = null;
    isLoading.value = true;
    const response = await api.get(`/students/${id}`);
    editingStudent.value = response.data;
  } catch (err) {
    console.error('Edit student error:', err);
    error.value = 'Failed to load student details';
  } finally {
    isLoading.value = false;
  }
};

// Create a new abort controller when needed
const resetAbortController = () => {
  abortController.value = new AbortController();
};

// Reset when search is cleared
watch(searchQuery, (newVal) => {
  if (!newVal.trim()) {
    searchResults.value = [];
  }
});

// Lifecycle hooks
onMounted(() => {
  resetAbortController();
  loadStudents();
});

onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort();
  }
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<template>
  <MainLayout pageTitle="Add Student">
    <div class="flex flex-col gap-8">
      <!-- Statistics and Control Panel -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <!-- Stats -->
        <div class="flex flex-col md:flex-row gap-4 md:items-center">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Total Students</h3>
            <p class="text-2xl font-bold text-blue-600">{{ totalStudents }}</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Selected</h3>
            <p class="text-2xl font-bold text-green-600">{{ selectedStudents.size }}</p>
          </div>
          
          <!-- Show loading indicator for "All" mode -->
          <div v-if="isLoadingAll" class="flex items-center text-blue-600">
            <ArrowPathIcon class="h-4 w-4 animate-spin mr-2" />
            <span class="text-sm">Loading all students...</span>
          </div>
        </div>
        
        <!-- Search box -->
        <div class="relative">
          <div class="flex items-center">
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                v-model="searchQuery"
                @input="handleSearchInput"
                placeholder="Search by student ID..."
                class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XMarkIcon class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
          <div v-if="isSearching" class="absolute right-3 top-2">
            <ArrowPathIcon class="h-5 w-5 animate-spin text-blue-500" />
          </div>
        </div>
        
        <!-- Page size selector -->
        <div class="flex items-center gap-2">
          <label for="page-size" class="text-sm font-medium text-gray-700">Show:</label>
          <select 
            id="page-size" 
            v-model="itemsPerPage" 
            @change="changePageSize(itemsPerPage)"
            class="rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            :disabled="showSearchResults"
          >
            <option v-for="size in availablePageSizes" :key="size" :value="size">
              {{ size }} entries
            </option>
            <option value="All">All</option>
          </select>
        </div>
      </div>
      
      <!-- Search results notification -->
      <div v-if="showSearchResults" class="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
        <p class="text-blue-600">
          <span class="font-medium">{{ searchResults.length }}</span> students found matching ID: <span class="font-medium">"{{ searchQuery }}"</span>
        </p>
        <button @click="clearSearch" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Clear search
        </button>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <button 
            @click="deleteSelectedStudents"
            :disabled="!hasSelections || isLoading || isLoadingAll"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <template v-if="isLoading && hasSelections">
              <ArrowPathIcon class="h-4 w-4 inline-block animate-spin mr-1" />
              Deleting...
            </template>
            <template v-else>
              Delete Selected ({{ selectedStudents.size }})
            </template>
          </button>
        </div>
        <div class="flex gap-2">
          <button 
            @click="isAddModalOpen = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Student
          </button>
          <button 
            @click="showSearchResults ? searchStudents() : loadStudents()" 
            :disabled="isLoading || isLoadingAll || isSearching"
            class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon class="h-5 w-5 mr-2" :class="{ 'animate-spin': isLoading || isSearching }" />
            Refresh
          </button>
        </div>
      </div>
      
      <!-- Loading and error states -->
      <div v-if="((isLoading || isLoadingAll) && !displayedStudents.length) || isSearching" class="text-center p-8">
        <div class="h-8 w-8 text-blue-600 mx-auto animate-spin">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          {{ isSearching ? 'Searching students...' : 'Loading students...' }}
        </p>
      </div>
      
      <div v-if="error" class="bg-red-50 p-4 rounded-lg">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>
      
      <!-- No results message -->
      <div v-if="showSearchResults && searchResults.length === 0 && !isSearching" class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-yellow-700">No students found matching ID: "{{ searchQuery }}"</p>
      </div>
      
      <!-- Table -->
      <div v-if="displayedStudents.length || (!isLoading && !error && !isSearching)" class="ring-1 ring-gray-200 rounded-lg bg-white overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-4 px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <input 
                  type="checkbox" 
                  :checked="allSelected"
                  @change="toggleAllStudents"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
              </th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Student ID</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Last Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">First Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Middle Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Course</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">College</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Campus</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Year Level</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Gender</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Student Status</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Scholarship</th>
              <th class="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="displayedStudents.length">
              <tr v-for="student in displayedStudents" :key="student.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-4">
                  <input 
                    type="checkbox" 
                    :checked="selectedStudents.has(student.id)"
                    @change="toggleStudentSelection(student.id)"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ student.student_id }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.last_name }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.first_name }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.middle_name || '–' }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.course }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.college }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.campus }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.year_level }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.gender }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.student_status }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.scholar_ship }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button @click="editStudent(student.id)" class="text-blue-600 hover:text-blue-900 mr-4">
                    View Student
                  </button>
                  <button 
                    @click="deleteStudent(student.id)" 
                    :disabled="deletingId === student.id"
                    class="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <template v-if="deletingId === student.id">
                      <ArrowPathIcon class="h-4 w-4 inline-block animate-spin mr-1" />
                      Deleting...
                    </template>
                    <template v-else>Delete</template>
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="12" class="px-6 py-8 text-center text-sm text-gray-500">
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination controls -->
      <div v-if="totalPages > 0 && !showSearchResults" class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-700">
          <span v-if="!isShowingAll">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} 
            to {{ Math.min(currentPage * itemsPerPage, totalStudents) }} 
            of {{ totalStudents }} students
          </span>
          <span v-else>
            Showing all {{ students.length }} of {{ totalStudents }} students
          </span>
        </div>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1 || isLoading || isLoadingAll || isShowingAll"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages || isLoading || isLoadingAll || isShowingAll"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      <!-- Add Student Modal -->
      <Dialog :open="isAddModalOpen" @close="closeAddModal" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div class="flex justify-between items-center mb-4">
              <DialogTitle class="text-lg font-semibold">Add Student</DialogTitle>
              <button 
                @click="closeAddModal"
                class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <StudentForm 
              @studentCreated="handleStudentCreated"
              @cancel="closeAddModal"
            />
          </DialogPanel>
        </div>
      </Dialog>
      
      <!-- Edit Student Modal -->
      <Dialog :open="!!editingStudent" @close="closeEditModal" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full rounded-xl p-6 shadow-lg">
            <div class="flex justify-between items-center mb-4">
              <DialogTitle class="text-lg font-semibold">Edit Student</DialogTitle>
              <button 
                @click="closeEditModal"
                class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <EditStudentForm 
              v-if="editingStudent"
              :student="editingStudent" 
              @studentUpdated="handleUpdate"
              @cancel="closeEditModal"
            />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  </MainLayout>
</template>
