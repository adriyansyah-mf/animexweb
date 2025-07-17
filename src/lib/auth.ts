// Auth utility functions

export interface LoginResponse {
  access_token: string;
  type: string;
}

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
} as const;

// Store authentication tokens
export const storeAuthTokens = (tokens: LoginResponse): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_TYPE, tokens.type);
  }
};

// Get stored access token
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }
  return null;
};

// Get stored token type
export const getTokenType = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_TYPE);
  }
  return null;
};

// Get authorization header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAccessToken();
  const tokenType = getTokenType();
  
  if (token && tokenType) {
    return {
      Authorization: `${tokenType} ${token}`
    };
  }
  
  return {};
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Clear authentication tokens (logout)
export const clearAuthTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_TYPE);
  }
};

// Decode JWT token (basic decode without verification)
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Make authenticated API request
export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = getAuthHeader();
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, requestOptions);
}; 