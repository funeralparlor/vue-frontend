<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div class="text-center">
        <img class="mx-auto h-12 w-auto" src="/bulsu_red.png" alt="Logo">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link 
            :to="{ name: 'login' }" 
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your account
          </router-link>
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Full Name"
            >
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Email address"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Password"
            >
          </div>
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              v-model="password_confirmation"
              name="password_confirmation"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Confirm Password"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :disabled="isLoading"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </div>

        

        
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  try {
    isLoading.value = true;
    const response = await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });
    localStorage.setItem('token', response.data.token);
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed. Please try again.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Add custom CSS here if needed */
</style>