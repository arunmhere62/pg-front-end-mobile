import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { networkLogger } from '../utils/networkLogger';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const state = store.getState();
        const token = state.auth.accessToken;
        const { user } = state.auth;
        const selectedPGLocationId = state.pgLocations.selectedPGLocationId;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add User ID header
        if (user?.s_no && config.headers) {
          config.headers['X-User-Id'] = user.s_no.toString();
        }

        // Add Organization ID header
        if (user?.organization_id && config.headers) {
          config.headers['X-Organization-Id'] = user.organization_id.toString();
        }

        // Add PG Location ID header
        if (selectedPGLocationId && config.headers) {
          config.headers['X-PG-Location-Id'] = selectedPGLocationId.toString();
        }

        // Log request
        (config as any).metadata = { startTime: new Date() };

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        const duration = new Date().getTime() - (response.config as any).metadata?.startTime?.getTime();
        const fullUrl = response.config.baseURL 
          ? `${response.config.baseURL}${response.config.url}` 
          : response.config.url || '';
        networkLogger.addLog({
          id: Date.now().toString(),
          method: response.config.method?.toUpperCase() || 'GET',
          url: fullUrl,
          status: response.status,
          requestData: response.config.data ? JSON.parse(response.config.data) : null,
          responseData: response.data,
          timestamp: new Date(),
          duration,
        });
        return response;
      },
      async (error: AxiosError) => {
        // Log error response
        const duration = new Date().getTime() - (error.config as any)?.metadata?.startTime?.getTime();
        const fullUrl = error.config?.baseURL 
          ? `${error.config.baseURL}${error.config.url}` 
          : error.config?.url || '';
        networkLogger.addLog({
          id: Date.now().toString(),
          method: error.config?.method?.toUpperCase() || 'GET',
          url: fullUrl,
          status: error.response?.status,
          requestData: error.config?.data ? JSON.parse(error.config.data as string) : null,
          responseData: error.response?.data,
          error: error.message,
          timestamp: new Date(),
          duration,
        });

        if (error.response?.status === 401) {
          // Token expired or invalid
          store.dispatch(logout());
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config = {}) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
