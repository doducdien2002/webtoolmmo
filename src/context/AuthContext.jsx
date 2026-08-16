import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    authService.getCurrentUser()
      .then((user) => { if (alive) setCurrentUser(user); })
      .catch(() => { if (alive) setCurrentUser(null); })
      .finally(() => { if (alive) setIsReady(true); });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const user = await authService.login(credentials);
    setCurrentUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const user = await authService.register(payload);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
  }, []);

  /** Đồng bộ lại currentUser từ storage (vd sau khi số dư thay đổi) */
  const refreshUser = useCallback(async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    return user;
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
