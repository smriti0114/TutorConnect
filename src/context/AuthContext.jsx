import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    mockDb.initialize();

    const storedUser = localStorage.getItem('tutoring_current_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('tutoring_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = mockDb.validateUser(email, password);
      if (user) {
        if (!user.active) {
          setError('This account has been deactivated. Please contact support.');
          setIsLoading(false);
          return false;
        }
        setCurrentUser(user);
        localStorage.setItem('tutoring_current_user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid email or password. Please try again or use the quick demo access buttons.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
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
