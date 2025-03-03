import { createRouter, createWebHistory } from 'vue-router';
import StudentsView from '@/views/StudentsView.vue'; // Use @ alias
import StudentList from '@/components/StudentList.vue'; // Use @ alias
import Dashboard from '@/components/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
          path: '/students',
          name: 'students',
          component: StudentsView,
      },
      {
        path: '/home',
        name: 'home',
        component: StudentsView,
    },

    {
      path: '/list',
      name: 'list',
      component: StudentList,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
    
      
  ],
});

export default router;