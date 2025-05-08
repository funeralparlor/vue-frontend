
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

// Import our inactivity tracker
import useInactivityTracker from '@/composables/useInactivityTracker';

// Props to receive page title
const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard'
  }
});

// Get current route and router
const route = useRoute();
const router = useRouter();

// Inactivity tracker setup
const showWarning = ref(false);
const warningTimer = ref(null);
const remainingTime = ref(60); // 60 seconds for warning countdown
const countdownInterval = ref(null);

// Configure inactivity tracker with 15 minutes timeout
const { isActive, resetTimer } = useInactivityTracker({
  timeout: 15 * 60 * 1000, // 15 minutes
  onLogout: () => {
    showWarning.value = false;
    if (countdownInterval.value) clearInterval(countdownInterval.value);
  }
});

// Clean up timers function
const cleanupTimers = () => {
  if (warningTimer.value) clearTimeout(warningTimer.value);
  if (countdownInterval.value) clearInterval(countdownInterval.value);
};

// Start countdown timer when warning appears
const startCountdown = () => {
  remainingTime.value = 60;
  if (countdownInterval.value) clearInterval(countdownInterval.value);
  
  countdownInterval.value = setInterval(() => {
    remainingTime.value -= 1;
    if (remainingTime.value <= 0) {
      clearInterval(countdownInterval.value);
    }
  }, 1000);
};

// Continue session function
const continueSession = () => {
  resetTimer();
  showWarning.value = false;
  
  // Clear intervals and timers
  if (countdownInterval.value) clearInterval(countdownInterval.value);
  if (warningTimer.value) clearTimeout(warningTimer.value);
  
  // Reset the warning timer
  warningTimer.value = setTimeout(() => {
    showWarning.value = true;
    startCountdown();
  }, 14 * 60 * 1000);
};

// Logout function
const logout = async () => {
  try {
    await api.post('/logout'); // Call the logout endpoint
    localStorage.removeItem('token'); // Remove the token from localStorage
    router.push({ name: 'login' }); // Redirect to the login page
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  } finally {
    // Clear all timers
    cleanupTimers();
  }
};

// User data
const user = ref({
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
});

// Navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'Add Student', href: '/home', icon: 'Users' },
  { name: 'Student List', href: '/list', icon: 'Folder' },
  { name: 'Scholarships & Colleges', href: '/settings', icon: 'Folder' },
  { name: 'Archive', href: '/trashbin', icon: 'Folder' },

];

// Compute navigation with current flag based on active route
const navigation = computed(() => {
  return navigationItems.map(item => ({
    ...item,
    current: route.path === item.href
  }));
});

// User navigation with logout action
const userNavigation = [
  { name: 'Settings', href: '/profile' },
  { name: 'Sign out', action: logout }, // Add logout action
];

// Combine all initialization and cleanup in single lifecycle hooks
onMounted(async () => {
  // Set up session timeout warning
  if (localStorage.getItem('token')) {
    warningTimer.value = setTimeout(() => {
      showWarning.value = true;
      startCountdown();
    }, 14 * 60 * 1000); // 14 minutes (1 minute before timeout)
  }
  
  // Add beforeunload event listener
  window.addEventListener('beforeunload', cleanupTimers);
  
  // Fetch user data
  try {
    const response = await api.get('/user');
    user.value.name = response.data.name;
    user.value.email = response.data.email;
    user.value.imageUrl = response.data.profile_image || 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png';
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
});

// Handle component unmount cleanup
onUnmounted(() => {
  cleanupTimers();
  window.removeEventListener('beforeunload', cleanupTimers);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar -->
    <Disclosure as="nav" class="lg:hidden bg-gray-900" v-slot="{ open }">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            
          </div>
          
        </div>
      </div>

      <DisclosurePanel class="lg:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <DisclosureButton 
            v-for="item in navigation" 
            :key="item.name" 
            as="a" 
            :href="item.href" 
            :class="[
              item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 
              'block rounded-md px-3 py-2 text-base font-medium'
            ]"
          >
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
          <p class="text-sm font-medium text-white">Student Scholarship Profiling </p>
          <span class="text-xs text-blue-400">Scholarship Office</span>
        </div>
      </div>
      <nav class="mt-6 px-4">
        <div class="space-y-4">
          <router-link 
            v-for="item in navigation" 
            :key="item.name" 
            :to="item.href"
            :class="[
              item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', 
              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
            ]"
          >
            {{ item.name }}
          </router-link>
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
                <a 
                  v-if="item.href" 
                  :href="item.href" 
                  :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                >
                  {{ item.name }}
                </a>
                <button
                  v-else
                  @click="item.action" 
                  :class="[active ? 'bg-gray-50' : '', 'block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900']"
                >
                  {{ item.name }}
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div class="p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-8">{{ pageTitle }}</h1>
        
        <!-- Slot for page content -->
        <slot></slot>
      </div>
    </main>

    <!-- Inactivity warning modal -->
    <div v-if="showWarning" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Session Timeout Warning</h3>
        <p class="mb-4">
          Your session is about to expire due to inactivity. You will be automatically logged out in 
          <span class="font-semibold text-red-600">{{ remainingTime }}</span> seconds.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="logout"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Logout now
          </button>
          <button 
            @click="continueSession"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Continue session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>