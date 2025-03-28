<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';

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

// Logout function
const logout = async () => {
  try {
    await api.post('/logout'); // Call the logout endpoint
    localStorage.removeItem('token'); // Remove the token from localStorage
    router.push({ name: 'login' }); // Redirect to the login page
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  }
};

// User data
const user = ref({
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
});

// Fetch user data when component mounts
onMounted(async () => {
  try {
    const response = await api.get('/user');
    user.value.name = response.data.name;
    user.value.email = response.data.email;
    user.value.imageUrl = response.data.profile_image || 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png';
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
});

// Navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'Add Student', href: '/home', icon: 'Users' },
  { name: 'Student List', href: '/list', icon: 'Folder' },
    { name: 'Trash Bin', href: '/trashbin', icon: 'Folder' },
  { name: '', href: '#', icon: 'Calendar' },
  { name: '', href: '#', icon: 'ChartBar' },
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
  { name: 'Settings', href: '/settings' },
  { name: 'Sign out', action: logout }, // Add logout action
];
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
  </div>
</template>
