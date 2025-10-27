import axios from 'axios';
import type { Application, AppointmentSchedule, SignatureData } from '../types/dashboard';

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

export const dashboardService = {
  // Junior Engineer APIs - get applications for document verification
  getJEApplications: async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      // Use ApplicationStage enum: 0 = JUNIOR_ENGINEER_PENDING, 1 = DOCUMENT_VERIFICATION_PENDING
      const stages = [0, 1]; // JUNIOR_ENGINEER_PENDING, DOCUMENT_VERIFICATION_PENDING
      const applications = [];
      
      for (const stage of stages) {
        const response = await api.post('/Application/list', {
          stage, // Use stage instead of status
          pageNumber,
          pageSize
        });
        
        if (response.data.success && response.data.data) {
          applications.push(...response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          applications.push(...response.data);
        }
      }

      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      console.error('Error fetching JE applications:', error);
      throw error;
    }
  },

  scheduleAppointment: async (applicationId: string, appointment: AppointmentSchedule) => {
    const response = await api.post(`/applications/${applicationId}/schedule-appointment`, appointment);
    return response.data;
  },

  approveJEApplication: async (applicationId: string, otp: string) => {
    const response = await api.post(`/applications/${applicationId}/je-approve`, { otp });
    return response.data;
  },

  rejectJEApplication: async (applicationId: string, otp: string, reasons: string) => {
    const response = await api.post(`/applications/${applicationId}/je-reject`, { otp, reasons });
    return response.data;
  },

  // Assistant Engineer APIs - get applications forwarded from JE
  getAEApplications: async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      // Use ApplicationStage enum: 2 = ASSISTANT_ENGINEER_PENDING
      const response = await api.post('/Application/list', {
        stage: 2, // ASSISTANT_ENGINEER_PENDING
        pageNumber,
        pageSize
      });
      
      let applications = [];
      if (response.data.success && response.data.data) {
        applications = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        applications = response.data;
      }

      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      console.error('Error fetching AE applications:', error);
      throw error;
    }
  },

  approveAEApplication: async (applicationId: string, otp: string) => {
    const response = await api.post(`/applications/${applicationId}/ae-approve`, { otp });
    return response.data;
  },

  rejectAEApplication: async (applicationId: string, otp: string, reasons: string) => {
    const response = await api.post(`/applications/${applicationId}/ae-reject`, { otp, reasons });
    return response.data;
  },

  // Executive Engineer APIs - get applications for signing (both stages)
  getEEApplications: async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      // Use ApplicationStage enum: 3 = EXECUTIVE_ENGINEER_PENDING, 7 = EXECUTIVE_ENGINEER_SIGN_PENDING
      const stages = [3, 7]; // EXECUTIVE_ENGINEER_PENDING, EXECUTIVE_ENGINEER_SIGN_PENDING
      const applications = [];
      
      for (const stage of stages) {
        const response = await api.post('/Application/list', {
          stage, // Use stage instead of status
          pageNumber,
          pageSize
        });
        
        if (response.data.success && response.data.data) {
          applications.push(...response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          applications.push(...response.data);
        }
      }

      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      console.error('Error fetching EE applications:', error);
      throw error;
    }
  },

  // City Engineer APIs - get applications for signing (both stages)
  getCEApplications: async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      // Use ApplicationStage enum: 4 = CITY_ENGINEER_PENDING, 8 = CITY_ENGINEER_SIGN_PENDING
      const stages = [4, 8]; // CITY_ENGINEER_PENDING, CITY_ENGINEER_SIGN_PENDING
      const applications = [];
      
      for (const stage of stages) {
        const response = await api.post('/Application/list', {
          stage, // Use stage instead of status
          pageNumber,
          pageSize
        });
        
        if (response.data.success && response.data.data) {
          applications.push(...response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          applications.push(...response.data);
        }
      }

      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      console.error('Error fetching CE applications:', error);
      throw error;
    }
  },

  // Clerk APIs - get applications for processing
  getClerkApplications: async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      // Use ApplicationStage enum: 6 = CLERK_PENDING
      const response = await api.post('/Application/list', {
        stage: 6, // CLERK_PENDING
        pageNumber,
        pageSize
      });
      
      let applications = [];
      if (response.data.success && response.data.data) {
        applications = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        applications = response.data;
      }

      return {
        success: true,
        applications: applications
      };
    } catch (error) {
      console.error('Error fetching Clerk applications:', error);
      throw error;
    }
  },

  signEEApplication: async (applicationId: string, signatureData: SignatureData, otp: string) => {
    const response = await api.post(`/applications/${applicationId}/ee-sign`, { 
      ...signatureData, 
      otp 
    });
    return response.data;
  },

  approveEEApplication: async (applicationId: string, otp: string, stage: 1 | 2) => {
    const response = await api.post(`/applications/${applicationId}/ee-approve`, { otp, stage });
    return response.data;
  },

  rejectEEApplication: async (applicationId: string, otp: string, reasons: string) => {
    const response = await api.post(`/applications/${applicationId}/ee-reject`, { otp, reasons });
    return response.data;
  },



  signCEApplication: async (applicationId: string, signatureData: SignatureData, otp: string) => {
    const response = await api.post(`/applications/${applicationId}/ce-sign`, { 
      ...signatureData, 
      otp 
    });
    return response.data;
  },

  approveCEApplication: async (applicationId: string, otp: string, stage: 1 | 2) => {
    const response = await api.post(`/applications/${applicationId}/ce-approve`, { otp, stage });
    return response.data;
  },

  rejectCEApplication: async (applicationId: string, otp: string, reasons: string) => {
    const response = await api.post(`/applications/${applicationId}/ce-reject`, { otp, reasons });
    return response.data;
  },



  processClerkApplication: async (
    applicationId: string, 
    otp: string, 
    data: {
      certificateNumber: string;
      paymentAmount: string;
      paymentDate: string;
    }
  ) => {
    const response = await api.post(`/applications/${applicationId}/clerk-process`, { 
      otp, 
      ...data 
    });
    return response.data;
  },

  // Common APIs
  getApplicationDetails: async (applicationId: string) => {
    const response = await api.get<Application>(`/applications/${applicationId}`);
    return response.data;
  },

  downloadDocument: async (documentId: string) => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getAuditTrail: async (applicationId: string) => {
    const response = await api.get(`/applications/${applicationId}/audit-trail`);
    return response.data;
  },

  // File upload for document upload step
  uploadDocument: async (file: File, documentType: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType.toString());

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // OTP related APIs
  requestOTP: async (purpose: 'login' | 'document' | 'approval', email?: string) => {
    const response = await api.post('/auth/request-otp', { purpose, email });
    return response.data;
  },

  verifyOTP: async (otp: string, purpose: 'login' | 'document' | 'approval') => {
    const response = await api.post('/auth/verify-otp', { otp, purpose });
    return response.data;
  },

  // Payment related APIs
  initiatePayment: async (applicationId: string) => {
    const response = await api.post(`/applications/${applicationId}/initiate-payment`);
    return response.data;
  },

  verifyPayment: async (applicationId: string, paymentId: string) => {
    const response = await api.post(`/applications/${applicationId}/verify-payment`, { paymentId });
    return response.data;
  },

  // Certificate download
  downloadCertificate: async (applicationId: string) => {
    const response = await api.get(`/applications/${applicationId}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadChallan: async (applicationId: string) => {
    const response = await api.get(`/applications/${applicationId}/challan`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Statistics for dashboard
  getDashboardStats: async (role: string) => {
    const response = await api.get(`/dashboard/stats/${role}`);
    return response.data;
  },
};

export default dashboardService;