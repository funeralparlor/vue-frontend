<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import EditStudentForm from '@/components/EditStudentForm.vue';
import StudentForm from '@/components/StudentForm.vue';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

// Reactive state
const students = ref([]);
const error = ref(null);
const editingStudent = ref(null);
const isAddModalOpen = ref(false);
const isLoading = ref(false);

// User and navigation data
const user = {
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
};

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'Home', current: true},
  { name: 'Student List', href: '/list', icon: 'Users',  },
  { name: '', href: '#', icon: 'Folder' },
  { name: '', href: '#', icon: 'Calendar' },
  { name: '', href: '#', icon: 'ChartBar' },
];

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

// Fetch students
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

// Handle student creation
const handleStudentCreated = (newStudent) => {
  students.value.push(newStudent);
  isAddModalOpen.value = false;
};

// Handle student deletion
const deleteStudent = async (id) => {
  if (!confirm('Are you sure?')) return;
  try {
    await api.delete(`/students/${id}`);
    students.value = students.value.filter(s => s.id !== id);
  } catch (err) {
    error.value = 'Failed to delete student';
  }
};

// Handle student update
const handleUpdate = (updatedStudent) => {
  const index = students.value.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students.value[index] = updatedStudent;
  }
  editingStudent.value = null;
};

// Fetch student details for editing
const editStudent = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    editingStudent.value = response.data;
  } catch (err) {
    error.value = 'Failed to load student details';
  }
};



// Load students on component mount
onMounted(loadStudents);
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

      <div class="p-8">
        <div class="flex flex-col gap-8">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">Student List</h1>
            <button
              @click="isAddModalOpen = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Student
            </button>
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
                      <button @click="deleteStudent(student.id)" class="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">
        
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Student Modal -->
    <Dialog :open="isAddModalOpen" @close="isAddModalOpen = false" class="relative z-50">
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <div class="flex justify-between items-center mb-4">
            <DialogTitle class="text-lg font-semibold">Add Student</DialogTitle>
            <button 
              @click="isAddModalOpen = false"
              class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <StudentForm 
            @studentCreated="handleStudentCreated"
            @cancel="isAddModalOpen = false"
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
  </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>