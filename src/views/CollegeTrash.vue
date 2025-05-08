<script setup>
import { ref, reactive, onMounted } from 'vue';
import { TrashIcon, RefreshCwIcon } from 'lucide-vue-next';
import CollegeService from '@/services/CollegeService';
import MainLayout from '@/components/MainLayout.vue';

// Reactive state management
const state = reactive({
  trashedColleges: [],
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  perPage: 10,
  isLoading: true,
  isRestoring: false,
  isDeleting: false,
  error: null
});

const notification = ref({
  show: false,
  message: '',
  type: 'info' // can be 'info', 'success', 'error'
});

// Show alert message
const showAlert = (message, type = 'info') => {
  notification.value = {
    show: true,
    message,
    type
  };

  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Fetch trash data with error handling
const loadTrashedColleges = async (page = 1) => {
  try {
    state.isLoading = true;
    state.error = null;
    
    const params = {
      page,
      limit: state.perPage
    };
    
    const response = await CollegeService.getTrash(params);
    state.trashedColleges = response.data.data;
    state.currentPage = response.data.page;
    state.totalPages = response.data.pages;
    state.totalItems = response.data.total;
  } catch (error) {
    handleError(error, 'Failed to load trashed colleges');
  } finally {
    state.isLoading = false;
  }
};

// Change page function
const changePage = (page) => {
  if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
    loadTrashedColleges(page);
  }
};

// Restore college with confirmation
const restoreCollege = async (id) => {
  if (!confirm('Are you sure you want to restore this college?')) return;
  
  try {
    state.isRestoring = true;
    await CollegeService.restore(id);
    showAlert('College restored successfully', 'success');
    await loadTrashedColleges(state.currentPage);
  } catch (error) {
    handleError(error, 'Failed to restore college');
  } finally {
    state.isRestoring = false;
  }
};

// Permanent deletion with confirmation
const permanentlyDelete = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this college? This action cannot be undone.')) return;
  
  try {
    state.isDeleting = true;
    await CollegeService.forceDelete(id);
    showAlert('College permanently deleted', 'success');
    
    // If this was the last item on the page and not the first page, go to previous page
    if (state.trashedColleges.length === 1 && state.currentPage > 1) {
      await loadTrashedColleges(state.currentPage - 1);
    } else {
      await loadTrashedColleges(state.currentPage);
    }
  } catch (error) {
    // Check for specific foreign key constraint error
    if (error.response?.data?.message?.includes('Column not found') && 
        error.response?.data?.message?.includes('college_id')) {
      showAlert('Cannot delete this college because it has related students. Update your database schema or detach students first.', 'error');
    } else {
      handleError(error, 'Failed to permanently delete college');
    }
  } finally {
    state.isDeleting = false;
  }
};

// Change per page items
const changePerPage = (value) => {
  state.perPage = parseInt(value);
  loadTrashedColleges(1); // Reset to first page when changing items per page
};

// Generate page numbers for pagination
const getPageNumbers = () => {
  const pages = [];
  const maxPages = 5; // Show max 5 page numbers
  
  let startPage = Math.max(1, state.currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(state.totalPages, startPage + maxPages - 1);
  
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
};

// Unified error handler
const handleError = (error, defaultMessage) => {
  console.error(error);
  
  const message = error.response?.data?.message || defaultMessage;
  const status = error.response?.status;
  
  if (status === 403) {
    showAlert('Unauthorized action', 'error');
  } else if (status === 404) {
    showAlert('College not found', 'error');
  } else {
    showAlert(message, 'error');
  }
};

// Initial data fetch
onMounted(() => loadTrashedColleges());
</script>

<template>
  <MainLayout pageTitle="College Trash">
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <!-- Header section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">College Trash Bin</h2>
          <p class="mt-1 text-sm text-gray-600">
            View, restore, or permanently delete trashed college records
          </p>
        </div>
      </div>

      <!-- Notification -->
      <div v-if="notification.show" 
        :class="[
          'fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50',
          notification.type === 'error' ? 'bg-red-50 text-red-700' :
          notification.type === 'success' ? 'bg-green-50 text-green-700' :
          'bg-blue-50 text-blue-700'
        ]">
        {{ notification.message }}
      </div>

      <!-- Loading state -->
      <div v-if="state.isLoading" class="text-center p-12">
        <p class="text-gray-600 animate-pulse">Loading trashed colleges...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="state.error" class="bg-red-50 p-4 rounded-md mb-6">
        <p class="text-red-700">{{ state.error }}</p>
        <button @click="loadTrashedColleges()" class="mt-2 text-red-600 underline">Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="state.trashedColleges.length === 0" class="text-center p-12 bg-gray-50 rounded-lg">
        <p class="text-gray-500">No colleges found in trash</p>
      </div>

      <!-- Colleges table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="college in state.trashedColleges" :key="college.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ college.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <div class="max-w-xs truncate">
                  {{ college.description || 'No description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(college.deleted_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                <button 
                  @click="restoreCollege(college.id)" 
                  :disabled="state.isRestoring"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 inline-flex items-center"
                >
                  <RefreshCwIcon class="w-4 h-4 mr-1" />
                  <span>Restore</span>
                </button>
                <button 
                  @click="permanentlyDelete(college.id)" 
                  :disabled="state.isDeleting"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 inline-flex items-center"
                >
                  <TrashIcon class="w-4 h-4 mr-1" />
                  <span>Delete Permanently</span>
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
        <div class="flex justify-center space-x-1" v-if="state.totalPages > 1">
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
          <template v-for="page in getPageNumbers()" :key="page">
            <button
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
    </div>
  </MainLayout>
</template>