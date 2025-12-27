import axios from 'axios';

export const API_BASE_URL = import.meta.env.PROD ? "https://selftracker.ahmedlotfy.site" : (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
