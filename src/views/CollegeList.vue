//Collegelist.vue
<script setup>
import { ref, computed, onMounted } from 'vue';
import CollegeForm from '@/views/CollegeForm.vue';
import CollegeService from '@/services/CollegeService';
import { Search, Edit, Trash, Plus } from 'lucide-vue-next';
import MainLayout from '@/components/MainLayout.vue';

// State
const colleges = ref([]);
const searchQuery = ref('');
const isLoading = ref(true);
const error = ref(null);
const pagination = ref({
  page: 1,
  pages: 1,
  total: 0,
  limit: 10
});

// Modal state
const showModal = ref(false);
const modalTitle = ref('');
const currentCollege = ref({
  name: '',
  description: '',
  active: true,
  courses: []
});
const isEditing = ref(false);

// Load colleges
const loadColleges = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await CollegeService.getAll({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value
    });
    
    colleges.value = response.data.data;
    pagination.value.page = response.data.page;
    pagination.value.pages = response.data.pages;
    pagination.value.total = response.data.total;
  } catch (err) {
    console.error('Failed to load colleges:', err);
    error.value = 'Failed to load colleges. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Open modal to create new college
const createCollege = () => {
  isEditing.value = false;
  currentCollege.value = {
    name: '',
    description: '',
    active: true,
    courses: []
  };
  modalTitle.value = 'Create New College';
  showModal.value = true;
};

// Open modal to edit college
const editCollege = (college) => {
  isEditing.value = true;
  // Clone college and include courses
  currentCollege.value = {
    ...college,
    // Make sure we include courses or default to empty array
    courses: Array.isArray(college.courses) ? [...college.courses] : []
  };
  modalTitle.value = 'Edit College';
  showModal.value = true;
};

// Handle modal form submission
const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await CollegeService.update(formData.id, formData);
    } else {
      await CollegeService.create(formData);
    }
    
    showModal.value = false;
    loadColleges();
  } catch (err) {
    console.error('Failed to save college:', err);
    error.value = 'Failed to save college. Please try again.';
  }
};

// Delete college
const deleteCollege = async (id) => {
  if (!confirm('Are you sure you want to move this college to trash?')) {
    return;
  }
  
  try {
    await CollegeService.delete(id);
    loadColleges();
  } catch (err) {
    console.error('Failed to delete college:', err);
    error.value = 'Failed to delete college. Please try again.';
  }
};

// Change page
const changePage = (page) => {
  pagination.value.page = page;
  loadColleges();
};

// Handle search
const handleSearch = () => {
  pagination.value.page = 1;
  loadColleges();
};

// Generate page numbers for pagination
const pageNumbers = computed(() => {
  const pages = [];
  const maxPages = 5; // Show max 5 page numbers
  
  let startPage = Math.max(1, pagination.value.page - Math.floor(maxPages / 2));
  let endPage = Math.min(pagination.value.pages, startPage + maxPages - 1);
  
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Load colleges when component mounts
onMounted(() => {
  loadColleges();
});
</script>

<template>
  <MainLayout pageTitle="Colleges">
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <!-- Header section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Colleges Management</h2>
          <p class="mt-1 text-sm text-gray-600">
            Manage colleges and their associated courses
          </p>
        </div>
        
        <button 
          @click="createCollege"
          class="mt-3 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus class="w-4 h-4 mr-1" />
          <span>Add New College</span>
        </button>
      </div>
      
      <!-- Search bar -->
      <div class="mb-6">
        <div class="flex">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search colleges..."
            class="flex-grow p-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            @keyup.enter="handleSearch"
          />
          <button 
            @click="handleSearch"
            class="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r hover:bg-gray-200"
          >
            <Search class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="text-gray-500">Loading colleges...</div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded-md mb-4">
        {{ error }}
        <button @click="loadColleges" class="ml-2 underline">Try again</button>
      </div>
      
      <!-- Empty state -->
      <div 
        v-else-if="colleges.length === 0 && !isLoading" 
        class="text-center py-12 bg-gray-50 rounded-lg"
      >
        <p class="text-gray-500 mb-3">No colleges found</p>
        <button 
          @click="createCollege"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Your First College
        </button>
      </div>
      
      <!-- Colleges table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Courses
            </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="college in colleges" :key="college.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ college.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <div class="max-w-xs truncate">
                  {{ college.description || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="college.courses && college.courses.length" class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {{ college.courses.length }} courses
              </span>
              <span v-else class="text-sm text-gray-500">
                No courses
              </span>
            </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="college.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ college.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                <button 
                  @click="editCollege(college)"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Edit class="w-4 h-4 inline" />
                  <span class="ml-1">Edit</span>
                </button>
                <button 
                  @click="deleteCollege(college.id)"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Trash class="w-4 h-4 inline" />
                  <span class="ml-1">Delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-6 flex flex-col sm:flex-row justify-between items-center">
        <div class="mb-4 sm:mb-0 text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} colleges
        </div>
        
        <!-- Pagination controls -->
        <div class="flex justify-center space-x-1">
          <!-- Previous page -->
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 rounded-md text-sm border"
            :class="pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &lsaquo;
          </button>
          
          <!-- Page numbers -->
          <button 
            v-for="page in pageNumbers" 
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 rounded-md text-sm border"
            :class="pagination.page === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
          
          <!-- Next page -->
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.pages"
            class="px-3 py-1 rounded-md text-sm border"
            :class="pagination.page === pagination.pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &rsaquo;
          </button>
        </div>
      </div>
      
      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ modalTitle }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <CollegeForm
            v-model="currentCollege"
            :is-editing="isEditing"
            @submit="handleSubmit"
            @cancel="showModal = false"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>