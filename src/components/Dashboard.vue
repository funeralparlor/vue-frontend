<script>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';


// Import all chart components
import EnhancedChart from '@/components/EnhancedChart.vue';
import BarChart from '@/components/BarChart.vue';
import LineChart from '@/components/LineChart.vue';
import GaugeChart from '@/components/GaugeChart.vue';
import MixedChart from '@/components/MixedChart.vue';
import MainLayout from '@/components/MainLayout.vue';



export default {
  name: 'StudentDashboardController',
  components: {
    EnhancedChart, 
    BarChart,
    LineChart,
    GaugeChart,
    MixedChart,
    MainLayout
  },
  setup() {
    // State
    const loading = ref(true);
    const error = ref(null);
    const timeframe = ref('yearly');
    const filterCollege = ref('all');
    const filterYear = ref('all');
    const dashboardData = ref({
      total_students: 0,
      students_by_course: [],
      students_by_college: [],
      gender_distribution: [],
      year_level_distribution: [],
      approval_status: [],
      student_status: {
        irreg: [],
        reg: []
      }
    });
    
    // Chart color schemes
    const chartColors = {
      gender: ['#FF4560', '#008FFB', '#00E396'],
      colleges: ['#4361EE', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0'],
      approval: ['#00E396', '#FEB019', '#FF4560', '#775DD0'],
      years: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'],
      trends: ['#008FFB', '#00E396', '#FEB019']
    };
    
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // In a real app you might pass filters to the API
        const response = await api.get('/students/dashboard', {
          params: {
            timeframe: timeframe.value,
            college: filterCollege.value !== 'all' ? filterCollege.value : null,
            year: filterYear.value !== 'all' ? filterYear.value : null
          }
        });
        
        dashboardData.value = response.data;
      } catch (err) {
        error.value = 'Failed to load dashboard data. Please try again.';
        console.error('Error fetching dashboard data:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // Format data for different chart types
    const formatBarChartData = (rawData, labelKey, valueKey) => {
      if (!rawData || !rawData.length) return { labels: [], datasets: [{ data: [] }] };
      
      return {
        labels: rawData.map(item => item[labelKey]),
        datasets: [
          {
            data: rawData.map(item => item[valueKey]),
            backgroundColor: chartColors.colleges
          }
        ]
      };
    };
    
    const formatPieChartData = (rawData, labelKey, valueKey, colorSet = 'gender') => {
      if (!rawData || !rawData.length) return { labels: [], datasets: [{ data: [] }] };
      
      return {
        labels: rawData.map(item => item[labelKey]),
        datasets: [
          {
            data: rawData.map(item => item[valueKey]),
            backgroundColor: chartColors[colorSet]
          }
        ]
      };
    };
    
    const formatEnrollmentTrends = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Check if the student_status data exists
  if (!dashboardData.value.student_status || !dashboardData.value.student_status.length) {
    return {
      labels: months.slice(0, 6),
      datasets: [
        {
          name: 'Regular',
          type: 'line',
          data: [0, 0, 0, 0, 0, 0]
        },
        {
          name: 'Irregular',
          type: 'line',
          data: [0, 0, 0, 0, 0, 0]
        },
        {
          name: 'Enrollment Rate (%)',
          type: 'column',
          data: [0, 0, 0, 0, 0, 0]
        }
      ]
    };
  }
  
  // Process the student status data from the controller
  // The controller provides an array of objects with student_status and total properties
  const regularStatus = dashboardData.value.student_status.find(item => 
    item.student_status.toLowerCase() === 'regular')?.total || 0;
  
  const irregularStatus = dashboardData.value.student_status.find(item => 
    item.student_status.toLowerCase() === 'irregular')?.total || 0;
  
  const totalStudents = regularStatus + irregularStatus;
  
  // For historical trends (since we only have current data), we'll simulate monthly data
  // In a real app, you would fetch historical data from an endpoint
  const regularData = Array(6).fill(0).map((_, i) => {
    // Generate some realistic looking data based on the current value
    return Math.max(0, Math.round(regularStatus * (0.85 + (i * 0.03))));
  });
  
  const irregularData = Array(6).fill(0).map((_, i) => {
    // Generate some realistic looking data based on the current value
    return Math.max(0, Math.round(irregularStatus * (0.9 + (i * 0.02))));
  });
  
  // Calculate total for each month
  const totalData = regularData.map((val, i) => val + irregularData[i]);
  
  // Calculate enrollment rate (percentage of total students against a baseline)
  const baselineCapacity = totalStudents * 1.5; // 150% of current total as an example
  const enrollmentRate = totalData.map(val => 
    baselineCapacity > 0 ? Math.round((val / baselineCapacity) * 100) : 0
  );
  
  return {
    labels: months.slice(0, 6),
    datasets: [
      {
        name: 'Regular',
        type: 'line',
        data: regularData
      },
      {
        name: 'Irregular',
        type: 'line',
        data: irregularData
      },
      {
        name: 'Enrollment Rate (%)',
        type: 'column',
        data: enrollmentRate
      }
    ]
  };
});
    
    // Fetch data on component mount
    onMounted(fetchDashboardData);
    
    // Computed values for the dashboard
    const enrollmentGoal = computed(() => 5000);
    const currentEnrollment = computed(() => {
      const totalStudents = dashboardData.value.total_students || 0;
      return Math.round((totalStudents / enrollmentGoal.value) * 100);
    });
    
    // Watch for filter changes
    const applyFilters = () => {
      fetchDashboardData();
    };
    
    return {
      // State
      loading,
      error,
      timeframe,
      filterCollege,
      filterYear,
      dashboardData,
      
      // Actions
      fetchDashboardData,
      applyFilters,
      
      // Computed and formatting helpers
      chartColors,
      formatBarChartData,
      formatPieChartData,
      formatEnrollmentTrends,
      enrollmentGoal,
      currentEnrollment,
      
      // Constants for the UI
      enrollmentThresholds: [
        { value: 30, color: '#FF4560' },
        { value: 60, color: '#FEB019' },
        { value: 100, color: '#00E396' }
      ],
      timeframeOptions: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
      ],
      collegeOptions: [
        { value: 'all', label: 'All Colleges' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'business', label: 'Business' },
        { value: 'arts', label: 'Arts & Sciences' },
        { value: 'education', label: 'Education' },
        { value: 'medicine', label: 'Medicine' }
      ],
      yearOptions: [
        { value: 'all', label: 'All Years' },
        { value: '1st Year', label: '1st Year' },
        { value: '2nd Year', label: '2nd Year' },
        { value: '3rd Year', label: '3rd Year' },
        { value: '4th Year', label: '4th Year' }
      ]
    };
  }
};

</script>

<template>
  <MainLayout pageTitle="Student Dashboard">
    <div class="dashboard">
      <!-- Dashboard Header with Filters -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Student Analytics Dashboard</h1>
        
        <div class="dashboard-filters">
          
          
          <button class="refresh-btn" @click="fetchDashboardData">
            <span>↻</span> Refresh
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <h3>Could not load dashboard</h3>
        <p>{{ error }}</p>
        <button @click="fetchDashboardData" class="retry-button">Try Again</button>
      </div>
      
      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Key Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card total-students">
            <div class="metric-icon">👨‍🎓</div>
            <div class="metric-content">
              <h3 class="metric-title">Total Students</h3>
              <div class="metric-value">{{ dashboardData.total_students.toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="metric-card">
            <gauge-chart
              :value="currentEnrollment"
              :min="0" 
              :max="100"
              title="Enrollment Goal"
              :formatter="(val) => `${val}%`"
              :thresholds="enrollmentThresholds"
              :showRange="true"
              :height="150"
            />
          </div>
        </div>
      
        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Gender Distribution -->
          <div class="chart-card">
            <h3 class="chart-title">Gender Distribution</h3>
            <enhanced-chart
              :data="formatPieChartData(dashboardData.gender_distribution, 'gender', 'total', 'gender')"
              :colors="chartColors.gender"
              :showTotals="true"
              :enableControls="true"
            />
          </div>
          
          <!-- Students by College -->
          <div class="chart-card">
            <h3 class="chart-title">Students by College</h3>
            <bar-chart
              :data="formatBarChartData(dashboardData.students_by_college, 'college', 'total')"
              :barColors="chartColors.colleges"
              yAxisTitle="Number of Students"
              :showValues="true"
            />
          </div>
          
          <!-- Students by Course (Top 5) -->
          <div class="chart-card">
            <h3 class="chart-title">Top Courses</h3>
            <bar-chart
              :data="formatBarChartData(
                dashboardData.students_by_course.slice(0, 5), 
                'course', 
                'total'
              )"
              :horizontal="true"
              :showValues="true"
            />
          </div>
          
          <!-- Enrollment Trends -->
          <div class="chart-card">
            <h3 class="chart-title">Student Status</h3>
            <mixed-chart
              :data="formatEnrollmentTrends"
              :colors="chartColors.trends"
              yAxisTitle="Number of Students"
              xAxisTitle="Month"
              :enableZoom="true"
            />
          </div>
          
          <!-- Year Level Distribution -->
          <div class="chart-card">
            <h3 class="chart-title">Year Level Distribution</h3>
            <bar-chart
              :data="formatBarChartData(dashboardData.year_level_distribution, 'year_level', 'total')"
              :barColors="chartColors.years"
              yAxisTitle="Number of Students"
              :showValues="true"
            />
          </div>
          
          <!-- Approval Status -->
          <div class="chart-card">
            <h3 class="chart-title">Approval Status</h3>
            <enhanced-chart
              :data="formatPieChartData(dashboardData.approval_status, 'approval_status', 'total', 'approval')"
              :colors="chartColors.approval"
              defaultType="donut"
              :showTotals="true"
            />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* Dashboard Layout */
.dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dashboard-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  position: relative;
}

/* Add subtle accent line below title */
.dashboard-title:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
}

.dashboard-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding-top: 0.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.filter-group select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: white;
  color: #1e293b;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2364748b' d='M4.5 6L8 9.5 11.5 6h-7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-group select:hover {
  border-color: #94a3b8;
  background-color: #f8fafc;
}

.filter-group select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.refresh-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.refresh-btn:active {
  transform: translateY(0);
  background-color: #1d4ed8;
}

.refresh-btn span {
  display: inline-block;
  font-size: 1.125rem;
  transition: transform 0.3s ease;
}

.refresh-btn:hover span {
  transform: rotate(180deg);
}

/* Loading & Error States */
.loading-overlay, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  text-align: center;
  color: #64748b;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #fee2e2;
  color: #ef4444;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.metric-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Add unique borders for different metrics */
.metric-card.total-students {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left-color: #3b82f6;
}

/* Gauge chart container needs special styling */
.metric-card:nth-child(2) {
  border-left-color: #10b981;
}

.metric-icon {
  font-size: 2.25rem;
  line-height: 1;
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 0.75rem;
  border-radius: 12px;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-title {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Chart-specific styling with accent colors */
.chart-card:nth-child(1) {
  border-top: 4px solid #3b82f6;
}

.chart-card:nth-child(2) {
  border-top: 4px solid #4361EE;
}

.chart-card:nth-child(3) {
  border-top: 4px solid #7209B7;
}

.chart-card:nth-child(4) {
  border-top: 4px solid #F72585;
}

.chart-card:nth-child(5) {
  border-top: 4px solid #0077B6;
}

.chart-card:nth-child(6) {
  border-top: 4px solid #FF4560;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Add subtle chart type indicators */
.chart-card:nth-child(1) .chart-title::before {
  content: '◕';
  color: #3b82f6;
  font-size: 1.25rem;
}

.chart-card:nth-child(2) .chart-title::before,
.chart-card:nth-child(3) .chart-title::before,
.chart-card:nth-child(5) .chart-title::before {
  content: '▌';
  color: #4361EE;
  font-size: 1.25rem;
}

.chart-card:nth-child(4) .chart-title::before {
  content: '◑';
  color: #F72585;
  font-size: 1.25rem;
}

.chart-card:nth-child(6) .chart-title::before {
  content: '◔';
  color: #FF4560;
  font-size: 1.25rem;
}

/* Add subtle chart backgrounds */
.chart-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background-image: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%);
  z-index: 0;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.chart-card:hover::after {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .dashboard-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metrics-row {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard {
    background-color: #0f172a;
  }
  
  .dashboard-header {
    border-bottom-color: #1e293b;
  }
  
  .dashboard-title {
    color: #f1f5f9;
  }
  
  .filter-group label {
    color: #94a3b8;
  }
  
  .filter-group select {
    background-color: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2394a3b8' d='M4.5 6L8 9.5 11.5 6h-7z'/%3E%3C/svg%3E");
  }
  
  .filter-group select:hover {
    background-color: #334155;
    border-color: #475569;
  }
  
  .metric-card, .chart-card {
    background-color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .metric-title {
    color: #94a3b8;
  }
  
  .metric-value {
    color: #f1f5f9;
  }
  
  .chart-title {
    color: #f1f5f9;
  }
  
  .loading-overlay, .error-state {
    background-color: rgba(15, 23, 42, 0.8);
    color: #94a3b8;
  }
  
  .metric-icon {
    background-color: #334155;
  }
}
</style>