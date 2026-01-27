/**
 * API Client
 * 
 * Centralized HTTP client for backend API communication.
 * Handles authentication tokens, error handling, and request/response transformation.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';

/**
 * Get stored JWT token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Store JWT token in localStorage
 * @param token - JWT token string
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make HTTP request to API
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param options - Fetch options
 * @returns Response data
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    // Network error (e.g., server unreachable)
    throw new ApiError(
      'Network error: Unable to connect to server',
      0,
      { networkError: true }
    );
  }

  // Handle non-JSON responses (e.g., 204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  // Try to parse JSON, handle non-JSON responses
  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        'Invalid JSON response from server',
        response.status,
        { parseError: true }
      );
    }
  } else {
    // Non-JSON response
    const text = await response.text();
    throw new ApiError(
      text || 'Unexpected response format',
      response.status,
      { text }
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
}

/**
 * GET request
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Authentication Server Base URL
 */
export { AUTH_BASE_URL };
