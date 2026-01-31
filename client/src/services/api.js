import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors (server not reachable)
        if (!error.response) {
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Cannot connect to server. Please ensure the server is running on port 5000.',
                background: '#1a1f35',
                color: '#fff',
                confirmButtonColor: '#00d4ff',
            });
            return Promise.reject(error);
        }

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

                    // Safely access nested data
                    const newToken = data?.data?.token;
                    const newRefreshToken = data?.data?.refreshToken;

                    if (newToken && newRefreshToken) {
                        localStorage.setItem('token', newToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    } else {
                        throw new Error('Invalid token refresh response');
                    }
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // Show error notification
        if (error.response?.data?.message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response.data.message,
                background: '#1a1f35',
                color: '#fff',
                confirmButtonColor: '#00d4ff',
            });
        }

        return Promise.reject(error);
    }
);

export default api;
