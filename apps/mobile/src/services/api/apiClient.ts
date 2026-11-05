import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../../config/env';
import { secureStorage } from '../storage/secureStore';
import { API_ROUTES, AuthResponse, ApiResponse } from '@solace/shared';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Mutex / Queue state for token refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Response Interceptor: Automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Avoid infinite refresh loops
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getItem(secureStorage.keys.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use raw axios instance to prevent recursive interceptors
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${ENV.API_URL}${API_ROUTES.AUTH.REFRESH}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const newTokens = refreshResponse.data.data?.tokens;
        if (!newTokens) {
          throw new Error('Refresh response missing tokens');
        }

        await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, newTokens.accessToken);
        await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, newTokens.refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        processQueue(null, newTokens.accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        await secureStorage.deleteItem(secureStorage.keys.ACCESS_TOKEN);
        await secureStorage.deleteItem(secureStorage.keys.REFRESH_TOKEN);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
