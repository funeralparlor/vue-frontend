<script setup>
import { ref, onMounted } from 'vue';
import { Bar, Pie, Line } from 'vue-chartjs';
import MainLayout from '@/components/MainLayout.vue';
import api from '../services/api';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/vue/24/outline';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
);

// Reactive state
const stats = ref({
  totalStudents: 0,
  activeScholarships: 0,
  pendingApplications: 0,
  totalCampuses: 0,
  genderDistribution: { male: 0, female: 0 },
  newApplicationsMonth: 0
});

const chartData = ref({
  scholarshipDistribution: null,
  enrollmentTrends: null,
  campusEnrollment: null
});

const recentActivity = ref([]);
const isLoading = ref(true);
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

// Fetch dashboard data
const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    
    const [statsRes, scholarshipRes, trendsRes, campusRes, activityRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/scholarship-distribution'),
      api.get('/dashboard/enrollment-trends'),
      api.get('/dashboard/campus-enrollment'),
      api.get('/dashboard/recent-activity')
    ]);

    stats.value = statsRes.data;
    chartData.value = {
      scholarshipDistribution: scholarshipRes.data,
      enrollmentTrends: trendsRes.data,
      campusEnrollment: campusRes.data
    };
    recentActivity.value = activityRes.data;
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadDashboardData);
</script>

<template>
  <MainLayout pageTitle="Dashboard">
    <div class="space-y-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="h-12 w-12 text-blue-600 animate-spin mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <p class="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Total Students -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-50 rounded-lg">
                <UserGroupIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Total Students</p>
                <h3 class="text-2xl font-semibold">{{ stats.totalStudents.toLocaleString() }}</h3>
              </div>
            </div>
          </div>

          <!-- Active Scholarships -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-50 rounded-lg">
                <AcademicCapIcon class="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Active Scholarships</p>
                <h3 class="text-2xl font-semibold">{{ stats.activeScholarships.toLocaleString() }}</h3>
              </div>
            </div>
          </div>

          <!-- Pending Applications -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-amber-50 rounded-lg">
                <ClockIcon class="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Pending Applications</p>
                <h3 class="text-2xl font-semibold">{{ stats.pendingApplications.toLocaleString() }}</h3>
              </div>
            </div>
          </div>

          <!-- Gender Distribution -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-50 rounded-lg">
                <UsersIcon class="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Test</p>
                <h3 class="text-2xl font-semibold">
                  {{ ((stats.genderDistribution.male / stats.totalStudents) * 100).toFixed(1) }}% M
                </h3>
                <p class="text-sm text-gray-500">
                  {{ ((stats.genderDistribution.female / stats.totalStudents) * 100).toFixed(1) }}% F
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Scholarship Distribution -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold mb-4">Scholarship Distribution</h3>
            <div class="h-64">
              <Pie
                v-if="chartData.scholarshipDistribution"
                :data="chartData.scholarshipDistribution"
                :options="chartOptions"
              />
            </div>
          </div>

          <!-- Enrollment Trends -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold mb-4">Enrollment Trends</h3>
            <div class="h-64">
              <Line
                v-if="chartData.enrollmentTrends"
                :data="chartData.enrollmentTrends"
                :options="{ ...chartOptions, plugins: { legend: { position: 'top' } } }"
              />
            </div>
          </div>

          <!-- Campus Enrollment -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 class="text-lg font-semibold mb-4">Campus Enrollment Distribution</h3>
            <div class="h-64">
              <Bar
                v-if="chartData.campusEnrollment"
                :data="chartData.campusEnrollment"
                :options="{ ...chartOptions, indexAxis: 'y' }"
              />
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold mb-4">Recent Applications</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="text-xs text-gray-500 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left">Student</th>
                  <th class="px-4 py-3 text-left">Program</th>
                  <th class="px-4 py-3 text-left">Campus</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-gray-200">
                <tr v-for="activity in recentActivity" :key="activity.id">
                  <td class="px-4 py-3">{{ activity.studentName }}</td>
                  <td class="px-4 py-3">{{ activity.program }}</td>
                  <td class="px-4 py-3">{{ activity.campus }}</td>
                  <td class="px-4 py-3">
                    <span :class="`px-2 py-1 rounded-full text-xs ${getStatusClass(activity.status)}`">
                      {{ activity.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3">{{ formatDate(activity.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style>
/* Add custom chart tooltip styling */
.chart-tooltip {

  backdrop-filter: blur(4px);
}
</style>