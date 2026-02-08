import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, role: string) => Promise<void>; // Simplified login for hackathon
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const storedToken = localStorage.getItem('cosmic_token');
    const storedUser = localStorage.getItem('cosmic_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, role: string) => {
    try {
      // In a real app, we would send password. 
      // For this hackathon UI, the user selects a role and enters credentials.
      // We will register/login in one go or just login.
      // Let's assume we call the backend to authenticate.
      
      // Attempt login first
      try {
        const response = await api.post('/auth/login', {
            username,
            password: 'password123', // Hardcoded for demo/hackathon ease if user doesn't provide
        });
        
        const { token: newToken, user: newUser } = response.data;
        handleAuthSuccess(newToken, newUser);
      } catch (loginError) {
        // If login fails (likely user doesn't exist), try register
        const registerResponse = await api.post('/auth/register', {
            username,
            password: 'password123',
            role
        });
        
        // Then login
         const loginResponse = await api.post('/auth/login', {
            username,
            password: 'password123',
        });
        const { token: newToken, user: newUser } = loginResponse.data;
        handleAuthSuccess(newToken, newUser);
      }

    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cosmic_token', newToken);
    localStorage.setItem('cosmic_user', JSON.stringify(newUser));
    
    // Legacy compatibility
    localStorage.setItem('cosmicwatch_isAuthenticated', 'true');
    localStorage.setItem('cosmicwatch_userRole', newUser.role);
    localStorage.setItem('cosmicwatch_username', newUser.username);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cosmic_token');
    localStorage.removeItem('cosmic_user');
    
    // Legacy compatibility
    localStorage.removeItem('cosmicwatch_isAuthenticated');
    localStorage.removeItem('cosmicwatch_userRole');
    localStorage.removeItem('cosmicwatch_username');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
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
