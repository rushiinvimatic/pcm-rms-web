// Utility for consistent API request configuration
export const getApiHeaders = (includeAuth: boolean = true, isFormData: boolean = false) => {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, ngrok-skip-browser-warning',
  };

  // Only add Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['x-access-token'] = token;
      headers['ngrok-skip-browser-warning'] = 'true';
    }
  }

  return headers;
};

export const getApiUrl = () => {
  // In development, use the proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5012/api';
};

export const makeApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${getApiUrl()}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = getApiHeaders(true, isFormData);

  // Handle preflight OPTIONS request for CORS
  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
    try {
      // Send preflight OPTIONS request
      await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Access-Control-Request-Method': options.method,
          'Access-Control-Request-Headers': Object.keys(defaultHeaders).join(', '),
        },
        mode: 'cors',
      });
    } catch (preflightError) {
      console.warn('Preflight request failed, continuing with main request:', preflightError);
    }
  }

  return fetch(url, {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};