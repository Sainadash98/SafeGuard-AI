import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sos_token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sos_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sos_token', token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('sos_token');
      setAuthToken('');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sos_user');
    }
  }, [user]);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/user/login', credentials);
      const { token: authToken, user: authUser, success, message } = response.data;
      if (!success) {
        throw new Error(message || 'Login failed');
      }
      setToken(authToken);
      setUser(authUser);
      return { success, message };
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/user/register', credentials);
      const { success, message } = response.data;
      if (!success) {
        throw new Error(message || 'Registration failed');
      }
      return { success, message };
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
