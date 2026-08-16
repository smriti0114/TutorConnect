import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('tutoring_jwt_token');
      if (token) {
        try {
          const user = await apiClient.get('/auth/me');
          setCurrentUser({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          });
        } catch (err) {
          localStorage.removeItem('tutoring_jwt_token');
          localStorage.removeItem('tutoring_current_user');
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    verifySession();

    // Listen for global session expiration events
    const handleExpire = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth_session_expired', handleExpire);
    return () => {
      window.removeEventListener('auth_session_expired', handleExpire);
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      
      const userObj = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };

      localStorage.setItem('tutoring_jwt_token', data.token);
      localStorage.setItem('tutoring_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tutoring_jwt_token');
    localStorage.removeItem('tutoring_current_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, error }}>
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
