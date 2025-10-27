export type UserRole = 
  | 'admin'
  | 'user' 
  | 'juniorarchitect'
  | 'assistantarchitect'
  | 'juniorlicenceengineer'
  | 'assistantlicenceengineer'
  | 'juniorstructuralengineer'
  | 'assistantstructuralengineer'
  | 'juniorsupervisor1'
  | 'assistantsupervisor1'
  | 'juniorsupervisor2'
  | 'assistantsupervisor2'
  | 'executiveengineer'
  | 'cityengineer'
  | 'clerk';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OTPRequest {
  email: string;
  purpose: 'login' | 'document' | 'approval';
}

export interface OTPVerification {
  email: string;
  otp: string;
  purpose: 'login' | 'document' | 'approval';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Officer login API response structure
export interface OfficerAuthResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string | null;
  email: string;
  role: string;
}

export interface OTPState {
  attempts: number;
  lastRequestTime: number;
  expiryTime: number;
  isLocked: boolean;
}