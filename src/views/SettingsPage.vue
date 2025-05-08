//settingspage.vue
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ScholarshipService from '@/services/ScholarshipService';
import CollegeService from '@/services/CollegeService';
import CampusService from '@/services/CampusService';
import YearLevelService from '@/services/YearLevelService';
import MainLayout from '@/components/MainLayout.vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';


const router = useRouter();
const activeTab = ref('scholarships');


// Data for options count
const optionCounts = ref({
  scholarships: { total: 0, active: 0 },
  colleges: { total: 0, active: 0 },
  courses: { total: 0, active: 0 },
  campuses: { total: 0, active: 0 },
  year_levels: { total: 0, active: 0 },
  sections: { total: 0, active: 0 }
});

// Loading state
const loading = ref(true);
const error = ref(null);

// Load summary counts for all option types
const loadOptionCounts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Load scholarship counts - we need to implement summary endpoints
    const scholarshipsResponse = await ScholarshipService.getAll();
    optionCounts.value.scholarships.total = scholarshipsResponse.data.total;
    optionCounts.value.scholarships.active = scholarshipsResponse.data.data.filter(s => s.active).length;

// Load scholarship counts - we need to implement summary endpoints
    const yearlevelsResponse = await YearLevelService.getAll();
    optionCounts.value.year_levels.total = yearlevelsResponse.data.total;
    optionCounts.value.year_levels.active = yearlevelsResponse.data.data.filter(s => s.active).length;
  

    // Load campus counts - we need to implement summary endpoints
    const campusesResponse = await CampusService.getAll();
    optionCounts.value.campuses.total = campusesResponse.data.total;
    optionCounts.value.campuses.active = campusesResponse.data.data.filter(s => s.active).length;

        // Load college counts - we need to implement summary endpoints
    const collegesResponse = await CollegeService.getAll();
    optionCounts.value.colleges.total = collegesResponse.data.total;
    optionCounts.value.colleges.active = collegesResponse.data.data.filter(s => s.active).length;
    
    
    // Load other option counts - these would need their own services
    // Each service would need a method to get counts (total and active)
    // Similar to how we did it for scholarships
    
    // Example (not implemented yet):
    // const collegesResponse = await CollegeService.getAll({ limit: -1 });
    // optionCounts.value.colleges.total = collegesResponse.data.total;
    // optionCounts.value.colleges.active = collegesResponse.data.data.filter(c => c.active).length;
    
    // For now, we'll use placeholder data for other options

    
  } catch (err) {
    console.error('Failed to load option counts:', err);
    error.value = 'Failed to load data. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Navigate to specific management page
const navigateTo = (route) => {
  router.push(route);
};

// Set active tab
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Load data when component mounts
onMounted(() => {
  loadOptionCounts();
});
</script>

<template>
    <MainLayout pageTitle="System Configuration">
        <p class="text-gray-500 mt-2">
        Manage dynamic options and system parameters
      </p>
    <div class="flex flex-col gap-8">
        
  <div class="settings-page">
   
    <div class="mb-8">
      
      
    </div>

    <!-- Loading state with skeleton -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div class="h-8 bg-gray-100 rounded"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
      <svg class="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
      <span class="text-red-600">{{ error }}</span>
      <button @click="loadOptionCounts" class="ml-3 text-red-700 font-medium hover:underline">Retry</button>
    </div>

    <!-- Settings content -->
    <div v-else class="grid md:grid-cols-12 gap-6">
      <!-- Left sidebar with tabs -->
      <div class="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-medium text-gray-700">Management Modules</h2>
        </div>
        <nav class="space-y-1 p-2">
          <button 
            v-for="item in [
              { id: 'scholarships', name: 'Scholarships', icon: '🎓' },
              { id: 'colleges', name: 'Colleges', icon: '🏛️' },
              { id: 'campuses', name: 'Campuses', icon: '🏫' },
              { id: 'year_levels', name: 'Year Levels', icon: '✎ᝰ.' },
                ]" 
                
             
          
            :key="item.id"
            @click="setActiveTab(item.id)"
            class="w-full flex items-center p-3 rounded-lg transition-all"
            :class="{
              'bg-blue-50 text-blue-600 shadow-sm': activeTab === item.id,
              'hover:bg-gray-50': activeTab !== item.id
            }"
          >
            <span class="text-xl mr-3">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.name }}</span>
            <span 
              class="ml-auto text-xs px-2 py-1 rounded-full"
              :class="{
                'bg-blue-100 text-blue-600': activeTab === item.id,
                'bg-gray-100 text-gray-600': activeTab !== item.id
              }"
            >
              {{ optionCounts[item.id]?.total || 0 }}
            </span>
          </button>
        </nav>
      </div>
      
      <!-- Right content area -->
      <div class="col-span-12 md:col-span-9 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <transition name="fade" mode="out-in">
          <!-- Scholarship Content -->
          <div v-if="activeTab === 'scholarships'" key="scholarships">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Scholarship Management</h2>
                <p class="text-sm text-gray-500 mt-1">
                  Configure student financial aid programs
                </p>
              </div>
              
              <div class="flex flex-wrap gap-2">
                
                <button 
                  @click="navigateTo('/scholarships/trash')"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Trash
                </button>
              </div>
            </div>
            
            <!-- Scholarship Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm text-gray-600">Total</div>
                    <div class="text-2xl font-bold text-gray-900">{{ optionCounts.scholarships.total }}</div>
                  </div>
                </div>
              </div>
             
            </div>

            <!-- Quick actions grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                @click="navigateTo('/scholarships')"
                class="p-4 border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:bg-blue-50 group"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </div>
                  <div class="text-left">
                    <div class="font-medium text-gray-900">Create New</div>
                    <div class="text-sm text-gray-500">Add new scholarship program</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Other tabs content (similar pattern with modern elements) -->
          <!-- Colleges Content -->
    <div v-else-if="activeTab === 'colleges'" key="colleges">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">College Management</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage academic colleges and courses
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          
          <button 
            @click="navigateTo('/colleges/trash')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Trash
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-600">Total</div>
              <div class="text-2xl font-bold text-gray-900">{{ optionCounts.colleges.total }}</div>
            </div>
          </div>
        </div>
       
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="navigateTo('/colleges')"
          class="p-4 border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:bg-blue-50 group"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">Create New</div>
              <div class="text-sm text-gray-500">Add new college</div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Courses Content -->
    <div v-else-if="activeTab === 'courses'" key="courses">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Course Management</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage academic programs and courses
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button 
            @click="navigateTo('/courses')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            New Course
          </button>
          <button 
            @click="navigateTo('/courses/trash')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Trash
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-600">Active</div>
              <div class="text-2xl font-bold text-gray-900">{{ optionCounts.courses.active }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 rounded-lg">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-600">Total</div>
              <div class="text-2xl font-bold text-gray-900">{{ optionCounts.courses.total }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="navigateTo('/courses')"
          class="p-4 border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:bg-blue-50 group"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">Create New</div>
              <div class="text-sm text-gray-500">Add new course</div>
            </div>
          </div>
        </button>
      </div>
    </div>


     <!-- Campuses Content -->
    <div v-else-if="activeTab === 'campuses'" key="campuses">
       <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Campus Management</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage academic campuses
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          
          <button 
            @click="navigateTo('/campuses/trash')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Trash
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-600">Total</div>
              <div class="text-2xl font-bold text-gray-900">{{ optionCounts.campuses.total }}</div>
            </div>
          </div>
        </div>
        
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="navigateTo('/campuses')"
          class="p-4 border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:bg-blue-50 group"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">Create New</div>
              <div class="text-sm text-gray-500">Add new campus</div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Year Level Content -->
    <div v-else-if="activeTab === 'year_levels'" key="year_levels">
       <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Year Level Management</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage academic year levels.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          
          <button 
            @click="navigateTo('/yearlevels/trash')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Trash
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-600">Total</div>
              <div class="text-2xl font-bold text-gray-900">{{ optionCounts.year_levels.total }}</div>
            </div>
          </div>
        </div>
        
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="navigateTo('/yearlevels')"
          class="p-4 border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:bg-blue-50 group"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">Create New</div>
              <div class="text-sm text-gray-500">Add new year level</div>
            </div>
          </div>
        </button>
      </div>
    </div>
          <!-- ... -->
          
        </transition>
      </div>
    </div>
  </div>
 
    </div>
     </MainLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>