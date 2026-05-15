// ═══════════════════════════════════════════════
//  src/context/AuthContext.jsx
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(() => localStorage.getItem('fv_token'));
  const [user, setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('fv_user')); } catch { return null; }
  });

  const saveSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fv_token', newToken);
    localStorage.setItem('fv_user', JSON.stringify(newUser));
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email || !password) throw new Error('Completa todos los campos.');
    const { ok, data } = await authApi.login(email, password);
    if (!ok) throw new Error(data.error || 'Credenciales incorrectas.');
    saveSession(data.token, data.usuario);
    return data.usuario;
  }, [saveSession]);

  const loginDirect = useCallback(async (email, password) => {
    const { ok, data } = await authApi.login(email, password);
    if (!ok) throw new Error(data.error || 'Credenciales incorrectas.');
    saveSession(data.token, data.usuario);
    return data.usuario;
  }, [saveSession]);

  const register = useCallback(async (payload) => {
    const { ok, data } = await authApi.register(payload);
    if (!ok) throw new Error(data.error || 'Error al registrar.');
    saveSession(data.token, data.usuario);
    return data.usuario;
  }, [saveSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fv_token');
    localStorage.removeItem('fv_user');
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, loginDirect, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
