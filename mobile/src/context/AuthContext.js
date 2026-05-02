import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUser = await AuthService.getCurrentUser();
      if (savedUser) setUser(savedUser);
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const data = await AuthService.login(username, password);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const register = (username, email, password, address, phone, roles) => {
    return AuthService.register(username, email, password, address, phone, roles);
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isArtist = user?.roles?.includes('ROLE_ARTIST');
  const isCustomer = user?.roles?.includes('ROLE_CUSTOMER');

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, isAdmin, isArtist, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
