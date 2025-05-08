
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://laravel-backend-4jkn.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // Required for Sanctum cookies
});




// Request interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - FIXED (using api instance instead of axios)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            const logoutReason = error.response.data?.logout_reason;
            
            if (logoutReason === 'inactivity') {
                // Show specific message for inactivity logout
                alert('Your session has expired due to inactivity. Please login again.');
            }
            
            localStorage.removeItem('token');
            router.push({ name: '/login' });
        }
        return Promise.reject(error);
    }
);


export default api;


