'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: 'free' | 'pro';
    noteLimit: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        fetchUserProfile(savedToken);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('👤 Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('👤 Profile data received:', data);
        setUser(data.user);
      } else {
        console.log('👤 Invalid token, clearing storage');
        
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('👤 Profile fetch error:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔑 Starting login process for:', email);
    
    try {
      const requestBody = { email, password };
      console.log('📤 Sending login request:', requestBody);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📦 Response data:', data);
      } else {
        const textData = await response.text();
        console.log('📄 Response text:', textData);
        throw new Error(`Invalid response format. Expected JSON, got: ${textData}`);
      }

      if (response.ok) {
        console.log('✅ Login successful!');
        setUser(data.user);
        setToken(data.token);
        
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
        }
        
        return { success: true };
      } else {
        console.error('❌ Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('🚨 Login network/parsing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    setToken(null);
    
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
