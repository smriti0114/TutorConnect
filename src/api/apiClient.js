const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Attach JWT token if present
    const token = localStorage.getItem('tutoring_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If expired or invalid token
        if (response.status === 401) {
          localStorage.removeItem('tutoring_jwt_token');
          localStorage.removeItem('tutoring_current_user');
          // Dispatch a custom event to notify AuthContext to redirect to login
          window.dispatchEvent(new Event('auth_session_expired'));
        }
        throw new Error(data.error || 'Something went wrong.');
      }

      return data;
    } catch (err) {
      throw new Error(err.message || 'Network request failed.');
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
