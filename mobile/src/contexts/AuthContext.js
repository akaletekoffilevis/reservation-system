import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.token);
    const decoded = JSON.parse(atob(data.token.split('.')[1]));
    setUser({ email, role: decoded.role, id: decoded.nameid });
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setAuthToken(data.token);
    const decoded = JSON.parse(atob(data.token.split('.')[1]));
    setUser({ email: userData.email, role: decoded.role, id: decoded.nameid });
    return data;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);