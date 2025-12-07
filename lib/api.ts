import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Employee {
  id: number;
  name: string;
  role: string;
  salary: number;
  email?: string;
  department?: string;
  performance_rating?: number;
  skills?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCreate {
  name: string;
  role: string;
  salary: number;
  email?: string;
  department?: string;
  performance_rating?: number;
  skills?: string;
}

export interface EmployeeUpdate {
  name?: string;
  role?: string;
  salary?: number;
  email?: string;
  department?: string;
}

export const employeeAPI = {
  getAll: async (params?: { skip?: number; limit?: number; search?: string; department?: string }) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (employee: EmployeeCreate) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },

  update: async (id: number, employee: EmployeeUpdate) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/employees/stats/summary');
    return response.data;
  },

  bulkCreate: async (employees: EmployeeCreate[]) => {
    const response = await api.post('/employees/bulk', employees);
    return response.data;
  },

  exportCSV: async () => {
    const response = await api.get('/employees/export/csv', { responseType: 'blob' });
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
