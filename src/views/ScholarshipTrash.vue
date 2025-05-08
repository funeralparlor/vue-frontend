//ScholarshipTrash.vue
<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import ScholarshipService from '@/services/ScholarshipService';
import MainLayout from '@/components/MainLayout.vue';

// Reactive state management
const state = reactive({
  trashedScholarships: [],
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  perPage: 10,
  isLoading: true,
  isRestoring: false,
  isDeleting: false,
  error: null
});

const notification = reactive({
  show: false,
  message: '',
  type: 'info' // can be 'info', 'success', 'error'
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

// Fetch trash data with error handling
const loadTrashedScholarships = async (page = 1) => {
  try {
    state.isLoading = true;
    state.error = null;
    
    const params = {
      page,
      limit: state.perPage
    };
    
    const response = await ScholarshipService.getTrash(params);
    state.trashedScholarships = response.data.data;
    state.currentPage = response.data.page;
    state.totalPages = response.data.pages;
    state.totalItems = response.data.total;
  } catch (error) {
    handleError(error, 'Failed to load trashed scholarships');
  } finally {
    state.isLoading = false;
  }
};

// Change page function
const changePage = (page) => {
  if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
    loadTrashedScholarships(page);
  }
};

// Restore scholarship with confirmation
const restoreScholarship = async (id) => {
  if (!confirm('Are you sure you want to restore this scholarship?')) return;
  
  try {
    state.isRestoring = true;
    await ScholarshipService.restore(id);
    showAlert('Scholarship restored successfully', 'success');
    await loadTrashedScholarships(state.currentPage);
  } catch (error) {
    handleError(error, 'Failed to restore scholarship');
  } finally {
    state.isRestoring = false;
  }
};

// Permanent deletion with confirmation
const permanentlyDelete = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this scholarship? This action cannot be undone.')) return;
  
  try {
    state.isDeleting = true;
    await ScholarshipService.forceDelete(id);
    showAlert('Scholarship permanently deleted', 'success');
    
    // If this was the last item on the page and not the first page, go to previous page
    if (state.trashedScholarships.length === 1 && state.currentPage > 1) {
      await loadTrashedScholarships(state.currentPage - 1);
    } else {
      await loadTrashedScholarships(state.currentPage);
    }
  } catch (error) {
    handleError(error, 'Failed to permanently delete scholarship');
  } finally {
    state.isDeleting = false;
  }
};

// Change per page items
const changePerPage = (value) => {
  state.perPage = value;
  loadTrashedScholarships(1); // Reset to first page when changing items per page
};

// Unified error handler
const handleError = (error, defaultMessage) => {
  console.error(error);
  
  const message = error.response?.data?.message || defaultMessage;
  const status = error.response?.status;
  
  if (status === 403) {
    showAlert('Unauthorized action', 'error');
  } else if (status === 404) {
    showAlert('Scholarship not found', 'error');
  } else {
    showAlert(message, 'error');
  }
};

// Initial data fetch
onMounted(() => loadTrashedScholarships());
</script>

<template>
  <MainLayout pageTitle="Scholarship Trash">
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <!-- Header section -->
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Scholarship Trash Bin</h2>
        <p class="mt-1 text-sm text-gray-600">
          View, restore, or permanently delete trashed scholarship records
        </p>
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
        <p class="text-gray-600 animate-pulse">Loading trashed scholarships...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="state.error" class="bg-red-50 p-4 rounded-md mb-6">
        <p class="text-red-700">{{ state.error }}</p>
        <button @click="loadTrashedScholarships()" class="mt-2 text-red-600 underline">Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="state.trashedScholarships.length === 0" class="text-center p-12 bg-gray-50 rounded-lg">
        <p class="text-gray-500">No scholarships found in trash</p>
      </div>

      <!-- Scholarships table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="scholarship in state.trashedScholarships" :key="scholarship.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ scholarship.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ scholarship.description || 'No description' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(scholarship.deleted_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                <button 
                  @click="restoreScholarship(scholarship.id)" 
                  :disabled="state.isRestoring"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                >
                  Restore
                </button>
                <button 
                  @click="permanentlyDelete(scholarship.id)" 
                  :disabled="state.isDeleting"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  Delete Permanently
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
    </div>
  </MainLayout>
</template>