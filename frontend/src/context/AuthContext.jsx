import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.data?.data?.user) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        // User is not authenticated or API is not available - this is fine
        // Silently fail and allow the app to render
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Set a timeout to ensure loading state doesn't block UI indefinitely
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 2000);
    
    initAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      return { success: false };
    } catch (error) {
      setUser(null);
      return { success: false };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const signup = async (email, password, organizationName) => {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        organizationName,
      });
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Signup failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      window.location.href = '/';
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email.',
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to reset password.',
      };
    }
  };

  const acceptInvitation = async (token, password) => {
    try {
      const response = await api.post(`/invitations/${token}/accept`, { password });
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to accept invitation.',
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    acceptInvitation,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
