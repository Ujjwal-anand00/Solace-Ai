import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../../config/env';
import { secureStorage } from '../storage/secureStore';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach bearer token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getItem(secureStorage.keys.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor: Standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Session expired - token cleanup will be integrated in auth feature step
      await secureStorage.deleteItem(secureStorage.keys.ACCESS_TOKEN);
    }
    return Promise.reject(error);
  },
);
