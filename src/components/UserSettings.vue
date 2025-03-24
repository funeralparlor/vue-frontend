<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';
import MainLayout from '@/components/MainLayout.vue'; // Your existing layout component

// Form state
const user = reactive({
  name: '',
  email: '', // Non-editable
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});

// Form submission states
const isLoading = ref(false);
const nameUpdateSuccess = ref(false);
const passwordUpdateSuccess = ref(false);
const errors = ref({});

// Fetch user data on component mount
onMounted(async () => {
  try {
    const response = await api.get('/user');
    user.name = response.data.name;
    user.email = response.data.email;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    alert('Failed to load user information. Please try again.');
  }
});

// Update name
const updateName = async () => {
  if (!user.name.trim()) {
    errors.value.name = 'Name cannot be empty';
    return;
  }

  isLoading.value = true;
  nameUpdateSuccess.value = false;
  errors.value = {};

  try {
    await api.put('/user/profile', { name: user.name });
    nameUpdateSuccess.value = true;
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      errors.value.general = 'Failed to update name. Please try again.';
    }
    console.error('Update name failed:', error);
  } finally {
    isLoading.value = false;
  }
};

// Update password
const updatePassword = async () => {
  // Basic validation
  if (!user.current_password) {
    errors.value.current_password = 'Current password is required';
    return;
  }
  
  if (!user.new_password) {
    errors.value.new_password = 'New password is required';
    return;
  }
  
  if (user.new_password !== user.new_password_confirmation) {
    errors.value.new_password_confirmation = 'Password confirmation does not match';
    return;
  }

  isLoading.value = true;
  passwordUpdateSuccess.value = false;
  errors.value = {};

  try {
    await api.put('/user/password', {
      current_password: user.current_password,
      password: user.new_password,
      password_confirmation: user.new_password_confirmation
    });
    
    // Clear password fields on success
    user.current_password = '';
    user.new_password = '';
    user.new_password_confirmation = '';
    passwordUpdateSuccess.value = true;
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else if (error.response?.data?.message) {
      errors.value.current_password = error.response.data.message;
    } else {
      errors.value.general = 'Failed to update password. Please try again.';
    }
    console.error('Update password failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <MainLayout pageTitle="Account Settings">
    <div class="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
      <!-- Name & Email Section -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
        <p class="text-sm text-gray-600 mb-6">
          Update your account's profile information.
        </p>

        <!-- Success message -->
        <div v-if="nameUpdateSuccess" class="mb-4 bg-green-50 p-4 rounded-md">
          <p class="text-sm text-green-700">Profile information updated successfully.</p>
        </div>

        <form @submit.prevent="updateName" class="space-y-6">
          <!-- Email (non-editable) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              :value="user.email"
              disabled
              class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
            />
            <p class="mt-1 text-sm text-gray-500">Your email address cannot be changed.</p>
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              v-model="user.name"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span v-if="isLoading">Saving...</span>
              <span v-else>Save</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Password Section -->
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Update Password</h2>
        <p class="text-sm text-gray-600 mb-6">
          Ensure your account is using a secure password.
        </p>

        <!-- Success message -->
        <div v-if="passwordUpdateSuccess" class="mb-4 bg-green-50 p-4 rounded-md">
          <p class="text-sm text-green-700">Password updated successfully.</p>
        </div>

        <!-- Error message -->
        <div v-if="errors.general" class="mb-4 bg-red-50 p-4 rounded-md">
          <p class="text-sm text-red-700">{{ errors.general }}</p>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-6">
          <!-- Current Password -->
          <div>
            <label for="current_password" class="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              id="current_password"
              type="password"
              v-model="user.current_password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.current_password" class="mt-1 text-sm text-red-600">{{ errors.current_password }}</p>
          </div>

          <!-- New Password -->
          <div>
            <label for="new_password" class="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="new_password"
              type="password"
              v-model="user.new_password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.new_password" class="mt-1 text-sm text-red-600">{{ errors.new_password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="new_password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="new_password_confirmation"
              type="password"
              v-model="user.new_password_confirmation"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.new_password_confirmation" class="mt-1 text-sm text-red-600">{{ errors.new_password_confirmation }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span v-if="isLoading">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>