import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

// API endpoints
export const endpoints = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  
  // Emergency
  createEmergency: '/api/emergency/create',
  getEmergencies: '/api/emergency',
  getEmergencyById: (id: string) => `/api/emergency/${id}`,
  updateEmergency: (id: string) => `/api/emergency/${id}`,
  
  // Vehicle
  getVehicles: '/api/vehicle',
  getVehicleById: (id: string) => `/api/vehicle/${id}`,
  updateVehicleLocation: (id: string) => `/api/vehicle/${id}/location`,
  
  // Traffic
  getTrafficData: '/api/traffic',
  getTrafficBySegment: (segmentId: string) => `/api/traffic/segment/${segmentId}`,
  
  // Signal
  getSignals: '/api/signal',
  requestPriority: '/api/signal/priority',
  
  // Analytics
  getAnalytics: '/api/analytics',
  getHotspots: '/api/analytics/hotspots',
  
  // Translation
  translate: '/api/translation/translate',
};
