import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { AuthState, User, UserRole } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType extends AuthState {
  login: (token: string, userInfo?: { email: string; role: string }) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  let inactivityTimer: number;

  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (state.isAuthenticated) {
      inactivityTimer = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initialize authentication state from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<{
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
          email?: string;
          user?: User;
          exp?: number;
        }>(token);
        
        // Check if token is expired
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        let user: User;
        
        if (decodedToken.user) {
          // Old format support
          user = decodedToken.user;
        } else {
          // Microsoft claims format
          const apiRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User';
          const initRoleMapping: Record<string, UserRole> = {
            'User': 'user',
            'Admin': 'admin',
            'JuniorEngineer': 'juniorarchitect',
            'JuniorArchitect': 'juniorarchitect',
            'AssistantEngineer': 'assistantarchitect',
            'AssistantArchitect': 'assistantarchitect',
            'JuniorLicenceEngineer': 'juniorlicenceengineer',
            'AssistantLicenceEngineer': 'assistantlicenceengineer',
            'JuniorStructuralEngineer': 'juniorstructuralengineer',
            'AssistantStructuralEngineer': 'assistantstructuralengineer',
            'JuniorSupervisor1': 'juniorsupervisor1',
            'AssistantSupervisor1': 'assistantsupervisor1',
            'JuniorSupervisor2': 'juniorsupervisor2',
            'AssistantSupervisor2': 'assistantsupervisor2',
            'ExecutiveEngineer': 'executiveengineer',
            'CityEngineer': 'cityengineer',
            'Clerk': 'clerk'
          };
          user = {
            id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
            email: decodedToken.email || '',
            role: initRoleMapping[apiRole] || 'user',
          };
        }
        
        dispatch({
          type: 'LOGIN',
          payload: { user, token },
        });
      } catch (error) {
        console.error('Failed to decode stored token:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    return () => {
      // Cleanup event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [state.isAuthenticated]);

  const login = (token: string, userInfo?: { email: string; role: string }) => {
    localStorage.setItem('token', token);
    
    let user: User;
    
    if (userInfo) {
      // Use provided user info from API response
      // Map API roles to internal roles
      const roleMapping: Record<string, UserRole> = {
        'User': 'user',
        'Admin': 'admin',
        'JuniorEngineer': 'juniorarchitect', // Map to existing role
        'JuniorArchitect': 'juniorarchitect',
        'AssistantEngineer': 'assistantarchitect', // Map to existing role
        'AssistantArchitect': 'assistantarchitect',
        'JuniorLicenceEngineer': 'juniorlicenceengineer',
        'AssistantLicenceEngineer': 'assistantlicenceengineer',
        'JuniorStructuralEngineer': 'juniorstructuralengineer',
        'AssistantStructuralEngineer': 'assistantstructuralengineer',
        'JuniorSupervisor1': 'juniorsupervisor1',
        'AssistantSupervisor1': 'assistantsupervisor1',
        'JuniorSupervisor2': 'juniorsupervisor2',
        'AssistantSupervisor2': 'assistantsupervisor2',
        'ExecutiveEngineer': 'executiveengineer',
        'CityEngineer': 'cityengineer',
        'Clerk': 'clerk'
      };
      
      user = {
        id: '', // Will be populated from token if needed
        email: userInfo.email,
        role: roleMapping[userInfo.role] || 'user' as UserRole,
      };
      console.log('Login with user info:', user);
    } else {
      // Fallback: try to decode token with Microsoft claims format
      try {
        const decodedToken = jwtDecode<{
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
          email?: string;
          user?: User;
        }>(token);
        
        if (decodedToken.user) {
          // Old format support
          user = decodedToken.user;
        } else {
          // Microsoft claims format
          user = {
            id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
            email: decodedToken.email || '',
            role: (decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() || 'user') as UserRole,
          };
        }
        console.log('Login with decoded token:', user);
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
        throw new Error('Invalid token');
      }
    }
    
    dispatch({
      type: 'LOGIN',
      payload: { user, token },
    });
    resetInactivityTimer();
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/auth/login');
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};