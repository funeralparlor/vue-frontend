//yearlevelList.vue
<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import YearLevelService from '@/services/YearLevelService';
import MainLayout from '@/components/MainLayout.vue';

// Reactive state management
const state = reactive({
  year_levels: [],
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  perPage: 10,
  isLoading: true,
  isSubmitting: false,
  isDeleting: false,
  error: null,
  search: ''
});

const notification = reactive({
  show: false,
  message: '',
  type: 'info' // can be 'info', 'success', 'error'
});

// Modal state
const modal = reactive({
  show: false,
  title: 'Add Year Level',
  formData: {
    id: null,
    name: '',
    description: '',
    active: true
  },
  formErrors: {}
});

// Show alert message
const showAlert = (message, type = 'info') => {
  notification.show = true;
  notification.message = message;
  notification.type = type;

  setTimeout(() => {
    notification.show = false;
  }, 3000);
};

// Load year levels with error handling
const loadYearLevels = async (page = 1) => {
  try {
    state.isLoading = true;
    state.error = null;
    
    const params = {
      page,
      limit: state.perPage,
      search: state.search || undefined
    };
    
    const response = await YearLevelService.getAll(params);
    state.year_levels = response.data.data;
    state.currentPage = response.data.page;
    state.totalPages = response.data.pages;
    state.totalItems = response.data.total;
  } catch (error) {
    handleError(error, 'Failed to load year levels');
  } finally {
    state.isLoading = false;
  }
};

// Change page function
const changePage = (page) => {
  if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
    loadYearLevels(page);
  }
};

// Open modal for adding
const openAddModal = () => {
  modal.formData = {
    id: null,
    name: '',
    description: '',
    active: true
  };
  modal.formErrors = {};
  modal.title = 'Add Year Level';
  modal.show = true;
};

// Open modal for editing
const openEditModal = (yearlevel) => {
  modal.formData = {
    id: yearlevel.id,
    name: yearlevel.name,
    description: yearlevel.description || '',
    active: yearlevel.active
  };
  modal.formErrors = {};
  modal.title = 'Edit Year Level';
  modal.show = true;
};

// Submit form
const submitForm = async () => {
  state.isSubmitting = true;
  modal.formErrors = {};
  
  try {
    if (modal.formData.id) {
      // Update existing
      await YearLevelService.update(modal.formData.id, modal.formData);
      showAlert('Year Level updated successfully', 'success');
    } else {
      // Create new
      await YearLevelService.create(modal.formData);
      showAlert('Year Level created successfully', 'success');
    }
    
    // Close modal and refresh list
    modal.show = false;
    loadYearLevels(state.currentPage);
  } catch (error) {
    if (error.response?.data?.errors) {
      modal.formErrors = error.response.data.errors;
    } else {
      handleError(error, 'Failed to save year level');
    }
  } finally {
    state.isSubmitting = false;
  }
};

// Delete year level with confirmation
const confirmDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this year level?')) return;
  
  try {
    state.isDeleting = true;
    await YearLevelService.delete(id);
    showAlert('Year Level deleted successfully', 'success');
    
    // If this was the last item on the page and not the first page, go to previous page
    if (state.year_levels.length === 1 && state.currentPage > 1) {
      await loadYearLevels(state.currentPage - 1);
    } else {
      await loadYearLevels(state.currentPage);
    }
  } catch (error) {
    handleError(error, 'Failed to delete year level');
  } finally {
    state.isDeleting = false;
  }
};

// Change per page items
const changePerPage = (value) => {
  state.perPage = value;
  loadYearLevels(1); // Reset to first page when changing items per page
};

// Unified error handler
const handleError = (error, defaultMessage) => {
  console.error(error);
  
  const message = error.response?.data?.message || defaultMessage;
  const status = error.response?.status;
  
  if (status === 403) {
    showAlert('Unauthorized action', 'error');
  } else if (status === 404) {
    showAlert('Year Level not found', 'error');
  } else {
    showAlert(message, 'error');
  }
};

// Watch for search changes (with debounce)
let searchTimeout;
watch(() => state.search, (newValue) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadYearLevels(1); // Reset to first page when searching
  }, 500);
});

// Initial data fetch
onMounted(() => loadYearLevels());
</script>

<template>
  <MainLayout pageTitle="Year Levels">
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <!-- Header section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Manage Year Levels</h2>
          <p class="mt-1 text-sm text-gray-600">
            Create, view, edit and delete year level programs.
          </p>
        </div>
        <button 
          @click="openAddModal" 
          class="mt-3 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Year Level
        </button>
      </div>
      
      <!-- Search bar -->
      <div class="mb-6">
        <input 
          v-model="state.search" 
          type="text" 
          placeholder="Search year levels..." 
          class="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>
      
      <!-- Notification -->
      <div v-if="notification.show" 
          :class="[
            'fixed bottom-4 right-4 p-4 rounded-md shadow-lg',
            notification.type === 'error' ? 'bg-red-50 text-red-700' :
            notification.type === 'success' ? 'bg-green-50 text-green-700' :
            'bg-blue-50 text-blue-700'
          ]">
          {{ notification.message }}
      </div>

      <!-- Loading state -->
      <div v-if="state.isLoading" class="text-center p-12">
        <p class="text-gray-600 animate-pulse">Loading year levels...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="state.error" class="bg-red-50 p-4 rounded-md mb-6">
        <p class="text-red-700">{{ state.error }}</p>
        <button @click="loadYearLevels()" class="mt-2 text-red-600 underline">Try again</button>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="state.year_levels.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">No year levels found</p>
        <button 
          @click="openAddModal" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add your first year level
        </button>
      </div>

      <!-- year levels table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="yearlevel in state.year_levels" :key="yearlevel.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ yearlevel.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ yearlevel.description || 'No description' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="{'bg-green-100 text-green-800': yearlevel.active, 'bg-red-100 text-red-800': !yearlevel.active}"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ yearlevel.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                <button 
                  @click="openEditModal(yearlevel)" 
                  :disabled="state.isSubmitting"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Edit
                </button>
                <button 
                  @click="confirmDelete(yearlevel.id)" 
                  :disabled="state.isDeleting"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Pagination -->
      <div v-if="state.totalPages > 0" class="mt-6 flex flex-col sm:flex-row justify-between items-center">
        <div class="mb-4 sm:mb-0 text-sm text-gray-700">
          Showing {{ ((state.currentPage - 1) * state.perPage) + 1 }} to 
          {{ Math.min(state.currentPage * state.perPage, state.totalItems) }} 
          of {{ state.totalItems }} items
        </div>
        
        <!-- Items per page selector -->
        <div class="mb-4 sm:mb-0 flex items-center space-x-2">
          <span class="text-sm text-gray-700">Items per page:</span>
          <select 
            v-model="state.perPage" 
            @change="changePerPage(state.perPage)"
            class="border border-gray-300 rounded-md text-sm py-1 px-2"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        
        <!-- Pagination controls -->
        <div class="flex justify-center space-x-1">
          <!-- First page -->
          <button
            @click="changePage(1)"
            :disabled="state.currentPage === 1"
            class="px-3 py-1 rounded-md text-sm border"
            :class="state.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &laquo;
          </button>
          
          <!-- Previous page -->
          <button
            @click="changePage(state.currentPage - 1)"
            :disabled="state.currentPage === 1"
            class="px-3 py-1 rounded-md text-sm border"
            :class="state.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &lsaquo;
          </button>
          
          <!-- Page numbers -->
          <template v-for="page in state.totalPages" :key="page">
            <!-- Display logic: show current page, and nearby pages -->
            <button
              v-if="page === 1 || page === state.totalPages || 
                   (page >= state.currentPage - 1 && page <= state.currentPage + 1) ||
                   (state.currentPage <= 3 && page <= 5) ||
                   (state.currentPage >= state.totalPages - 2 && page >= state.totalPages - 4)"
              @click="changePage(page)"
              :class="[
                'px-3 py-1 rounded-md text-sm border',
                page === state.currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            
            <!-- Ellipsis for skipped pages -->
            <span
              v-else-if="
                (page === 2 && state.currentPage > 4) ||
                (page === state.totalPages - 1 && state.currentPage < state.totalPages - 3)
              "
              class="px-2 py-1 text-gray-500"
            >
              ...
            </span>
          </template>
          
          <!-- Next page -->
          <button
            @click="changePage(state.currentPage + 1)"
            :disabled="state.currentPage === state.totalPages"
            class="px-3 py-1 rounded-md text-sm border"
            :class="state.currentPage === state.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &rsaquo;
          </button>
          
          <!-- Last page -->
          <button
            @click="changePage(state.totalPages)"
            :disabled="state.currentPage === state.totalPages"
            class="px-3 py-1 rounded-md text-sm border"
            :class="state.currentPage === state.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            &raquo;
          </button>
        </div>
      </div>
      
      <!-- Modal for add/edit -->
      <div v-if="modal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 class="text-xl font-bold mb-4">{{ modal.title }}</h3>
          
          <form @submit.prevent="submitForm">
            <!-- Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Year Level Name*
              </label>
              <input 
                v-model="modal.formData.name" 
                type="text" 
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                :class="{'border-red-500': modal.formErrors.name}"
              />
              <div v-if="modal.formErrors.name" class="text-red-500 text-sm mt-1">
                {{ modal.formErrors.name[0] }}
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea 
                v-model="modal.formData.description" 
                class="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                :class="{'border-red-500': modal.formErrors.description}"
              ></textarea>
              <div v-if="modal.formErrors.description" class="text-red-500 text-sm mt-1">
                {{ modal.formErrors.description[0] }}
              </div>
            </div>
            
            <!-- Active Status -->
            <div class="mb-4">
              <label class="flex items-center">
                <input type="checkbox" v-model="modal.formData.active" class="mr-2 h-4 w-4 text-blue-600" />
                <span class="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            
            <!-- Buttons -->
            <div class="flex justify-end space-x-2 mt-6">
              <button 
                type="button" 
                @click="modal.show = false"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="state.isSubmitting"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                :class="{'opacity-50 cursor-not-allowed': state.isSubmitting}"
              >
                {{ state.isSubmitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>