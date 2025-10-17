import { getAuthToken } from '../contexts/AuthContext';

// Base URL - change this when connecting to real backend
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add authentication token if required
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle different HTTP status codes
      if (!response.ok) {
        await this.handleError(response);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: ApiError;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: 'An unexpected error occurred',
        status: response.status,
      };
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('zzp_auth_token');
        localStorage.removeItem('zzp_user_data');
        window.location.href = '/login';
        throw new Error('Sesja wygasła. Zaloguj się ponownie.');

      case 403:
        // Forbidden
        throw new Error('Brak uprawnień do wykonania tej operacji.');

      case 404:
        throw new Error(errorData.message || 'Nie znaleziono zasobu.');

      case 422:
        // Validation error
        throw new Error(errorData.message || 'Błąd walidacji danych.');

      case 500:
        throw new Error('Błąd serwera. Spróbuj ponownie później.');

      default:
        throw new Error(errorData.message || 'Wystąpił nieoczekiwany błąd.');
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const api = new ApiService();

// =============================================================================
// AUTH ENDPOINTS
// =============================================================================

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }, { requiresAuth: false }),

  register: (userData: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    companyName?: string;
    phone?: string;
  }) => api.post('/auth/register', userData, { requiresAuth: false }),

  refreshToken: () => api.post('/auth/refresh'),

  logout: () => api.post('/auth/logout'),
};

// =============================================================================
// APPOINTMENTS ENDPOINTS (Admin)
// =============================================================================

export const appointmentsApi = {
  getAll: (filters?: { status?: string; dateFrom?: string; dateTo?: string }) =>
    api.get(`/appointments${filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : ''}`),

  getById: (id: string) => api.get(`/appointments/${id}`),

  confirm: (id: string, slotData: { date: string; time: string }) =>
    api.patch(`/appointments/${id}/confirm`, slotData),

  markTestResult: (id: string, result: { passed: boolean; notes?: string }) =>
    api.patch(`/appointments/${id}/test-result`, result),

  createWorkerAccount: (appointmentId: string) =>
    api.post(`/appointments/${appointmentId}/create-worker`),
};

// =============================================================================
// WORKERS ENDPOINTS (Admin & Employer)
// =============================================================================

export const workersApi = {
  getAll: (filters?: {
    category?: string;
    level?: string;
    city?: string;
    languages?: string[];
    rateMin?: number;
    rateMax?: number;
    availability?: 'active' | 'busy';
  }) =>
    api.get(`/workers${filters ? `?${new URLSearchParams(filters as unknown as Record<string, string>)}` : ''}`),

  getById: (id: string) => api.get(`/workers/${id}`),

  updateProfile: (id: string, data: unknown) => api.patch(`/workers/${id}`, data),

  updateAvailability: (id: string, availability: 'active' | 'busy') =>
    api.patch(`/workers/${id}/availability`, { availability }),

  activate: (id: string) => api.patch(`/workers/${id}/activate`),

  deactivate: (id: string) => api.patch(`/workers/${id}/deactivate`),
};

// =============================================================================
// EMPLOYERS ENDPOINTS (Admin)
// =============================================================================

export const employersApi = {
  getAll: (filters?: { subscriptionPlan?: string; status?: string }) =>
    api.get(`/employers${filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : ''}`),

  getById: (id: string) => api.get(`/employers/${id}`),

  block: (id: string) => api.patch(`/employers/${id}/block`),

  unblock: (id: string) => api.patch(`/employers/${id}/unblock`),

  updateSubscription: (id: string, plan: string) =>
    api.patch(`/employers/${id}/subscription`, { plan }),
};

// =============================================================================
// CERTIFICATES ENDPOINTS (Admin & Worker)
// =============================================================================

export const certificatesApi = {
  getAll: (filters?: { status?: string; expiringWithinDays?: number }) =>
    api.get(`/certificates${filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : ''}`),

  getById: (id: string) => api.get(`/certificates/${id}`),

  getByWorker: (workerId: string) => api.get(`/certificates/worker/${workerId}`),

  generate: (workerId: string) => api.post(`/certificates/generate`, { workerId }),

  download: (id: string) => api.get(`/certificates/${id}/download`),

  sendEmail: (id: string, email: string) =>
    api.post(`/certificates/${id}/send-email`, { email }),

  revoke: (id: string, reason?: string) =>
    api.patch(`/certificates/${id}/revoke`, { reason }),

  verify: (certificateNumber: string) =>
    api.get(`/certificates/verify/${certificateNumber}`, { requiresAuth: false }),
};

// =============================================================================
// SCHEDULE ENDPOINTS (Admin)
// =============================================================================

export const scheduleApi = {
  getSlots: (dateFrom: string, dateTo: string) =>
    api.get(`/schedule/slots?dateFrom=${dateFrom}&dateTo=${dateTo}`),

  updateCapacity: (date: string, time: string, capacity: number) =>
    api.patch(`/schedule/capacity`, { date, time, capacity }),

  blockDate: (date: string) => api.post(`/schedule/block`, { date }),

  unblockDate: (date: string) => api.delete(`/schedule/block/${date}`),
};

// =============================================================================
// SUBSCRIPTION ENDPOINTS (Employer)
// =============================================================================

export const subscriptionApi = {
  getCurrent: () => api.get('/subscription/current'),

  getUsage: () => api.get('/subscription/usage'),

  getBillingHistory: () => api.get('/subscription/billing-history'),

  getPaymentMethod: () => api.get('/subscription/payment-method'),

  updatePaymentMethod: (paymentMethodId: string) =>
    api.post('/subscription/payment-method', { paymentMethodId }),

  changePlan: (plan: string) => api.post('/subscription/change-plan', { plan }),

  cancel: (reason?: string) => api.post('/subscription/cancel', { reason }),

  createCheckoutSession: (plan: string) =>
    api.post('/subscription/create-checkout', { plan }, { requiresAuth: false }),
};

// =============================================================================
// CONTACTS ENDPOINTS (Employer & Worker)
// =============================================================================

export const contactsApi = {
  create: (workerId: string, message: string) =>
    api.post('/contacts', { workerId, message }),

  getByEmployer: () => api.get('/contacts/employer'),

  getByWorker: () => api.get('/contacts/worker'),

  updateStatus: (id: string, status: 'accepted' | 'declined') =>
    api.patch(`/contacts/${id}/status`, { status }),
};

// =============================================================================
// STATISTICS ENDPOINTS
// =============================================================================

export const statsApi = {
  getAdminStats: () => api.get('/stats/admin'),

  getEmployerStats: () => api.get('/stats/employer'),

  getWorkerStats: () => api.get('/stats/worker'),
};

export default api;
