import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Load from localStorage on first render
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (userId) setCurrentUser(userId);
    if (storedRefreshToken) setRefreshToken(storedRefreshToken);
  }, []);

  const login = (userId, token) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('refreshToken', token);
    setCurrentUser(userId);
    setRefreshToken(token);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken'); // in case you’re storing it
    setCurrentUser(null);
    setRefreshToken(null);
  };

  const value = {
    currentUser,
    refreshToken,
    login,
    logout,
    setCurrentUser,       // ✅ make sure this is included
    setRefreshToken,      // ✅ same here if you’re using it
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
