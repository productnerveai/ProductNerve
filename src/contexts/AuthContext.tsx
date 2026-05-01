import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  website?: string;
  business_email?: string;
  phone?: string;
  plan_type: string;
  subscription_plan?: string;
  subscription_status?: string;
  workspace_limit?: number;
  project_limit?: number;
  max_workspaces?: number;
  max_projects_per_workspace?: number;
  report_access: boolean;
  tool_access: boolean;
  role: string;
  email_verified: boolean;
  user_status: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (token: string, password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and validate user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    try {
      const [firstName, lastName] = fullName.split(' ');
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName || '',
          company_name: companyName
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.data.message);
        return {};
      } else {
        toast.error(data.error || 'Registration failed');
        return { error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error during registration';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        toast.success('Welcome back!');
        return {};
      } else {
        toast.error(data.error || 'Login failed');
        return { error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error during login';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.data.message);
        return {};
      } else {
        toast.error(data.error || 'Failed to send reset email');
        return { error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error during password reset';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const updatePassword = async (token: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        // Fetch user data after password reset
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.data.token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.data);
        }
        
        toast.success(data.data.message);
        return {};
      } else {
        toast.error(data.error || 'Failed to reset password');
        return { error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error during password reset';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
