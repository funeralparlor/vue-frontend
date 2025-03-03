<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import EditStudentForm from '@/components/EditStudentForm.vue';
import StudentForm from '@/components/StudentForm.vue';
import MainLayout from '@/components/MainLayout.vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

// Reactive state
const students = ref([]);
const error = ref(null);
const editingStudent = ref(null);
const isAddModalOpen = ref(false);
const isLoading = ref(false);
const deletingId = ref(null);
const abortController = ref(new AbortController());

// Fetch students with abort controller
const loadStudents = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await api.get('/students', { 
      signal: abortController.value.signal 
    });
    students.value = response.data;
  } catch (err) {
    if (err.name === 'AbortError') return;
    error.value = 'Failed to load students. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Modal handlers
const closeAddModal = () => isAddModalOpen.value = false;
const closeEditModal = () => editingStudent.value = null;

// Handle student creation
const handleStudentCreated = (newStudent) => {
  students.value.push(newStudent);
  closeAddModal();
};

// Handle student deletion
const deleteStudent = async (id) => {
  if (!confirm('Are you sure?')) return;
  try {
    deletingId.value = id;
    error.value = null;
    await api.delete(`/students/${id}`);
    students.value = students.value.filter(s => s.id !== id);
  } catch (err) {
    error.value = 'Failed to delete student';
  } finally {
    deletingId.value = null;
  }
};

// Handle student update
const handleUpdate = (updatedStudent) => {
  const index = students.value.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) students.value.splice(index, 1, updatedStudent);
  closeEditModal();
};

// Fetch student details for editing
const editStudent = async (id) => {
  try {
    error.value = null;
    const response = await api.get(`/students/${id}`);
    editingStudent.value = response.data;
  } catch (err) {
    error.value = 'Failed to load student details';
  }
};

// Lifecycle hooks
onMounted(loadStudents);
onUnmounted(() => abortController.value.abort());
</script>

<template>
  <MainLayout pageTitle="Student List">
    <div class="flex flex-col gap-8">
      <div class="flex items-center justify-between">
        <div></div> <!-- Empty div to maintain spacing with flexbox -->
        <div class="flex gap-2">
          <button 
            @click="isAddModalOpen = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Student
          </button>

          <!-- Refresh Button -->
          <button 
            @click="loadStudents" 
            :disabled="isLoading"
            class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon class="h-5 w-5 mr-2 animate-spin" v-if="isLoading" />
            <ArrowPathIcon class="h-5 w-5 mr-2" v-else />
            Refresh Data
          </button>
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

      <!-- Table -->
      <div v-else class="ring-1 ring-gray-200 rounded-lg bg-white">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Student ID</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Last Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">First Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Middle Name</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Semester</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Course</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Campus</th>
              <th class="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Scholarship Type</th>
              <th class="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="students.length">
              <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50 transition-colors">
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ student.student_id }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.last_name }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.first_name }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.middle_name || '–' }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.semester }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.course }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.campus }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ student.scholarship_type }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button @click="editStudent(student.id)" class="text-blue-600 hover:text-blue-900 mr-4">
                    Edit
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
              <td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Student Modal -->
    <!-- Enhanced Add Student Modal -->
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
    <Dialog :open="!!editingStudent" @close="editingStudent = null" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <div class="flex justify-between items-center mb-4">
            <DialogTitle class="text-lg font-semibold">Edit Student</DialogTitle>
            <button 
              @click="editingStudent = null"
              class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <EditStudentForm 
            :student="editingStudent" 
            @studentUpdated="handleUpdate"
            @cancel="editingStudent = null"
          />
        </DialogPanel>
      </div>
    </Dialog>
  </MainLayout>
</template>