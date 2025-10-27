import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5012/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, ngrok-skip-browser-warning',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  // Ensure ngrok header is always present
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

export interface DashboardStats {
  totalApplications: number;
  activeOfficers: number;
  pendingApprovals: number;
  completedApplications: number;
}

export interface Officer {
  id: string;
  email: string;
  role: string;
  name?: string;
  isActive: boolean;
  lastLogin?: string;
  createdDate: string;
}

export interface InviteOfficerRequest {
  email: string;
  role: string;
}

export interface InviteOfficerResponse {
  success: boolean;
  message: string;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/Admin/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data as fallback
      return {
        totalApplications: 1247,
        activeOfficers: 23,
        pendingApprovals: 45,
        completedApplications: 1089,
      };
    }
  },

  /**
   * Get all officers
   */
  getOfficers: async (): Promise<Officer[]> => {
    try {
      const response = await api.get<Officer[]>('/Admin/officers');
      return response.data;
    } catch (error) {
      console.error('Error fetching officers:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          email: 'admin@pmc.gov.in',
          role: 'Admin',
          name: 'Administrator',
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdDate: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'engineer@pmc.gov.in',
          role: 'ExecutiveEngineer',
          name: 'Executive Engineer',
          isActive: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
  },

  /**
   * Invite a new officer
   */
  inviteOfficer: async (email: string, role: string): Promise<InviteOfficerResponse> => {
    try {
      const requestData: InviteOfficerRequest = {
        email,
        role
      };
      
      const response = await api.post<InviteOfficerResponse>('/Auth/invite-officer', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting officer:', error);
      
      let message = 'Failed to invite officer. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  /**
   * Update officer status (activate/deactivate)
   */
  updateOfficerStatus: async (officerId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put(`/Admin/officers/${officerId}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('Error updating officer status:', error);
      
      let message = 'Failed to update officer status. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  /**
   * Delete officer
   */
  deleteOfficer: async (officerId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/Admin/officers/${officerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting officer:', error);
      
      let message = 'Failed to delete officer. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  /**
   * Get officer details by ID
   */
  getOfficerById: async (officerId: string): Promise<Officer> => {
    try {
      const response = await api.get<Officer>(`/Admin/officers/${officerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching officer details:', error);
      throw error;
    }
  },

  /**
   * Update officer role
   */
  updateOfficerRole: async (officerId: string, newRole: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put(`/Admin/officers/${officerId}/role`, { role: newRole });
      return response.data;
    } catch (error: any) {
      console.error('Error updating officer role:', error);
      
      let message = 'Failed to update officer role. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  /**
   * Get system audit logs
   */
  getAuditLogs: async (pageNumber: number = 1, pageSize: number = 50): Promise<any> => {
    try {
      const response = await api.post('/Admin/audit-logs', {
        pageNumber,
        pageSize
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  /**
   * Get system settings
   */
  getSystemSettings: async (): Promise<any> => {
    try {
      const response = await api.get('/Admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async (settings: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put('/Admin/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      
      let message = 'Failed to update system settings. Please try again.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  /**
   * Get application statistics by time period
   */
  getApplicationStats: async (period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    try {
      const response = await api.get(`/Admin/application-stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },

  /**
   * Get officer performance metrics
   */
  getOfficerPerformance: async (officerId?: string): Promise<any> => {
    try {
      const url = officerId ? `/Admin/officer-performance/${officerId}` : '/Admin/officer-performance';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching officer performance:', error);
      throw error;
    }
  },

  /**
   * Export applications to CSV/Excel
   */
  exportApplications: async (format: 'csv' | 'excel', filters?: any): Promise<Blob> => {
    try {
      const response = await api.post(`/Admin/export-applications?format=${format}`, filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  },

  /**
   * Send system notification to all officers
   */
  sendSystemNotification: async (title: string, message: string, targetRoles?: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/Admin/send-notification', {
        title,
        message,
        targetRoles
      });
      return response.data;
    } catch (error: any) {
      console.error('Error sending system notification:', error);
      
      let errorMessage = 'Failed to send system notification. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
};