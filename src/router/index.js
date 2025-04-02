import { createRouter, createWebHistory } from 'vue-router';
import StudentsView from '@/views/StudentsView.vue';
import StudentList from '@/components/StudentList.vue';
import Dashboard from '@/components/Dashboard.vue';
import Login from '@/views/Login.vue';
import Landing from '@/views/landing.vue';
import UserSettings from '@/components/UserSettings.vue';
import auth from '@/router/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/',
      name: 'landing',
      component: Landing,
      meta: {
        requiresAuth: true,
        middleware: [auth]
      }
    },
    { 
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/students',
      name: 'students',
      component: StudentsView,
      meta: { 
        requiresAuth: true,
        middleware: [auth]
      }
    },
    {
      path: '/home',
      name: 'home',
      component: StudentsView,
      meta: { 
        requiresAuth: true,
        middleware: [auth] 
      }
    },
    {
      path: '/list',
      name: 'list',
      component: StudentList,
      meta: { 
        requiresAuth: true,
        middleware: [auth] 
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { 
        requiresAuth: true,
        middleware: [auth] 
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: UserSettings,
      meta: { 
        requiresAuth: true,
        middleware: [auth] 
      }
    },
    {
      path: '/trashbin',
      component: () => import('@/components/TrashBin.vue'),
      meta: { 
        requiresAuth: true,
        middleware: [auth] 
      }
    }
  ],
});

// Combined navigation guard that handles both authentication and middleware
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' });
  }
  
  // Redirect authenticated users from guest routes
  if (to.meta.requiresGuest && token) {
    return next({ name: 'home' });
  }
  
  // If the route has middleware, execute it
  if (to.meta.middleware) {
    const middleware = [...to.meta.middleware]; // Create a copy to avoid mutation issues
    
    // Execute middleware chain
    const context = { to, from, next };
    
    // Start middleware chain execution
    return executeMiddleware(context, middleware);
  }
  
  return next();
});

// Helper function to execute middleware chain
function executeMiddleware(context, middleware) {
  const nextMiddleware = middleware.shift();
  
  if (!nextMiddleware) {
    return context.next();
  }
  
  return nextMiddleware({
    ...context,
    next: () => executeMiddleware(context, middleware)
  });
}

// Update the auth middleware file as well
export default router;