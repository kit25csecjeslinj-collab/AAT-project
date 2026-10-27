/**
 * @file api.ts
 * @description API client for communicating with Express backend endpoints.
 */

import { DashboardData, DatabaseStatus, Department, Employee, PerformanceReview, UserSession } from '../types/index.ts';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.text()) as unknown as T;
}

export const api = {
  // Auth
  login: async (username: string, password: string): Promise<{ success: boolean; user: UserSession }> => {
    return fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Database Status
  getDBStatus: async (): Promise<{ success: boolean; data: DatabaseStatus }> => {
    return fetchJSON(`${API_BASE}/db/status`);
  },

  // Dashboard
  getDashboard: async (): Promise<{ success: boolean; data: DashboardData }> => {
    return fetchJSON(`${API_BASE}/dashboard`);
  },

  // Employees
  getEmployees: async (params?: {
    search?: string;
    department_id?: string;
    employment_status?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Employee[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchJSON(`${API_BASE}/employees?${searchParams.toString()}`);
  },

  getEmployeeById: async (id: number): Promise<{ success: boolean; data: Employee }> => {
    return fetchJSON(`${API_BASE}/employees/${id}`);
  },

  createEmployee: async (data: Partial<Employee>): Promise<{ success: boolean; data: Employee }> => {
    return fetchJSON(`${API_BASE}/employees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<{ success: boolean; data: Employee }> => {
    return fetchJSON(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleEmployeeStatus: async (id: number): Promise<{ success: boolean; data: Employee }> => {
    return fetchJSON(`${API_BASE}/employees/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  deleteEmployee: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchJSON(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // Departments
  getDepartments: async (): Promise<{ success: boolean; data: Department[] }> => {
    return fetchJSON(`${API_BASE}/departments`);
  },

  createDepartment: async (data: { department_name: string; description?: string }): Promise<{ success: boolean; data: Department }> => {
    return fetchJSON(`${API_BASE}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDepartment: async (id: number, data: { department_name?: string; description?: string }): Promise<{ success: boolean; data: Department }> => {
    return fetchJSON(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDepartment: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchJSON(`${API_BASE}/departments/${id}`, {
      method: 'DELETE',
    });
  },

  // Performance Reviews
  getReviews: async (params?: {
    employee_id?: string;
    department_id?: string;
    review_status?: string;
    min_rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: PerformanceReview[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchJSON(`${API_BASE}/reviews?${searchParams.toString()}`);
  },

  getReviewById: async (id: number): Promise<{ success: boolean; data: PerformanceReview }> => {
    return fetchJSON(`${API_BASE}/reviews/${id}`);
  },

  createReview: async (data: any): Promise<{ success: boolean; data: PerformanceReview }> => {
    return fetchJSON(`${API_BASE}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReview: async (id: number, data: any): Promise<{ success: boolean; data: PerformanceReview }> => {
    return fetchJSON(`${API_BASE}/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteReview: async (id: number): Promise<{ success: boolean; message: string }> => {
    return fetchJSON(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Reports
  getDepartmentPerformanceReport: async (): Promise<{ success: boolean; data: Department[] }> => {
    return fetchJSON(`${API_BASE}/reports/department-performance`);
  },

  getPerformanceTrendsReport: async (): Promise<{ success: boolean; data: any[] }> => {
    return fetchJSON(`${API_BASE}/reports/performance-trends`);
  },

  getEmployeeRankingsReport: async (): Promise<{ success: boolean; data: any[] }> => {
    return fetchJSON(`${API_BASE}/reports/employee-rankings`);
  },

  getReviewStatusReport: async (): Promise<{ success: boolean; data: any }> => {
    return fetchJSON(`${API_BASE}/reports/review-status`);
  },

  // SQL & Viva Scripts
  getSqlScripts: async (): Promise<{
    success: boolean;
    data: {
      schemaSql: string;
      sampleDataSql: string;
      reportsSql: string;
      dbDesignMd: string;
      testPlanMd: string;
    };
  }> => {
    return fetchJSON(`${API_BASE}/sql/scripts`);
  },

  executeSQL: async (query: string): Promise<{
    success: boolean;
    data: {
      source: string;
      results: any[];
      rowCount: number;
      fields: string[];
    };
  }> => {
    return fetchJSON(`${API_BASE}/sql/execute`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};
