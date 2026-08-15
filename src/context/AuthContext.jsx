import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    setIsReady(true);
  }, []);

  const login = useCallback((credentials) => {
    const user = authService.login(credentials);
    const { password, ...safe } = user;
    setCurrentUser(safe);
    return safe;
  }, []);

  const register = useCallback((payload) => {
    const user = authService.register(payload);
    const { password, ...safe } = user;
    setCurrentUser(safe);
    return safe;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
  }, []);

  /** Đồng bộ lại currentUser từ storage (vd sau khi số dư thay đổi) */
  const refreshUser = useCallback(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const value = {
    currentUser,
    isReady,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
