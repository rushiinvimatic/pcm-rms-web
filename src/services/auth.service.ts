import axios from 'axios';
import type { AuthResponse, LoginCredentials, OTPRequest, OTPVerification, UserRole } from '../types/auth';

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

export const authService = {
  // Request OTP for user login or document access
  requestOTP: async (data: OTPRequest) => {
    // The API expects a GET request with email as a query parameter
    const response = await api.get<{ message: string }>(`/OtpAttempt/generate?emailAddress=${encodeURIComponent(data.email)}`);
    return response.data;
  },

  // Verify OTP and get JWT token
  verifyOTP: async (data: OTPVerification) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      token: string;
      refreshToken: string | null;
      email: string;
      role: string;
    }>('/Auth/verify-otp', {
      email: data.email,
      otp: data.otp
    });
    
    // Transform the response to match the expected AuthResponse format
    const apiData = response.data;
    return {
      user: {
        id: '', // Will be populated from token
        email: apiData.email,
        role: apiData.role.toLowerCase() as UserRole,
      },
      token: apiData.token,
      // Store the raw API response for additional processing if needed
      _rawResponse: apiData
    } as AuthResponse & { _rawResponse?: any };
  },

  // Officer login with email and password
  officerLogin: async (credentials: LoginCredentials) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      token: string;
      refreshToken: string | null;
      email: string;
      role: string;
      user: string;
    }>('/Auth/token', credentials);
    return response.data;
  },

  // Request password reset for officers
  requestPasswordReset: async (email: string) => {
    const response = await api.post<{ message: string }>('/auth/officer/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post<{ message: string }>('/auth/officer/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Refresh JWT token
  refreshToken: async () => {
    const response = await api.post<AuthResponse>('/auth/refresh-token');
    return response.data;
  },

  // Validate current session
  validateSession: async () => {
    const response = await api.get<{ valid: boolean }>('/auth/validate-session');
    return response.data;
  },
};