import { createRouter, createWebHistory } from 'vue-router';
import StudentsView from '@/views/StudentsView.vue';
import StudentList from '@/components/StudentList.vue';
import Dashboard from '@/components/Dashboard.vue';
import Login from '@/views/Login.vue'; // Add missing import
import Landing from '@/views/landing.vue';
import UserSettings from '@/components/UserSettings.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/',
      name: 'landing',
      component: Landing,
      meta: { requiresGuest: true } // New meta field
    },
    { 
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true } // New meta field
    },
    {
      path: '/students',
      name: 'students',
      component: StudentsView,
     meta: { requiresAuth: true }  //Protect this route
    },
    {
      path: '/home',
      name: 'home',
      component: StudentsView,
     meta: { requiresAuth: true }
    },
    {
      path: '/list',
      name: 'list',
      component: StudentList,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },

    {
      path: '/settings',
      name: 'settings',
      component: UserSettings,
      meta: { requiresAuth: true } 
    },

    {
      path: '/trashbin',
      component: () => import('@/components/TrashBin.vue'),
      meta: { requiresAuth: true }
  }
  ],
});

// Add navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' });
  }
  // Redirect authenticated users from guest routes
  else if (to.meta.requiresGuest && token) {
    next({ name: 'home' }); // Or your preferred redirect route
  } else {
    next();
  }
});

export default router;