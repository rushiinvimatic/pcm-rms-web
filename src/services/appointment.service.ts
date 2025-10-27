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
    'Accept': '*/*',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  return config;
});

export interface ScheduleAppointmentRequest {
  model?: string; // Required by API
  applicationId: string;
  comments: string;
  reviewDate: string; // ISO date string
  contactPerson: string;
  place: string;
  roomNumber: string;
}

export interface ScheduleAppointmentResponse {
  success: boolean;
  message: string;
  appointmentId?: string;
}

export const appointmentService = {
  /**
   * Schedule an appointment for an application
   */
  scheduleAppointment: async (request: ScheduleAppointmentRequest): Promise<ScheduleAppointmentResponse> => {
    try {
      // Add required model field if not provided
      const requestWithModel = {
        model: 'ScheduleAppointmentModel',
        ...request
      };
      
      console.log('Sending appointment request:', requestWithModel);
      const response = await api.post<ScheduleAppointmentResponse>('/Application/schedule-appointment', requestWithModel);
      return response.data;
    } catch (error: any) {
      console.error('Schedule appointment error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to schedule appointment');
    }
  },

  /**
   * Get appointment details for an application
   */
  getAppointmentDetails: async (applicationId: string) => {
    try {
      const response = await api.get(`/Application/${applicationId}/appointment`);
      return response.data;
    } catch (error: any) {
      console.error('Get appointment details error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get appointment details');
    }
  },

  /**
   * Update an existing appointment
   */
  updateAppointment: async (appointmentId: string, request: Partial<ScheduleAppointmentRequest>) => {
    try {
      const response = await api.put(`/Application/appointment/${appointmentId}`, request);
      return response.data;
    } catch (error: any) {
      console.error('Update appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId: string) => {
    try {
      const response = await api.delete(`/Application/appointment/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },

  /**
   * Get list of applications by status for appointment scheduling
   */
  getApplicationsList: async (status: number, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const request = {
        status,
        pageNumber,
        pageSize
      };
      
      console.log('Fetching applications list:', request);
      const response = await api.post('/Application/list', request);
      return response.data;
    } catch (error: any) {
      console.error('Get applications list error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get applications list');
    }
  }
};