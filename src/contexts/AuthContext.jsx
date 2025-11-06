import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    // Mock login
    await new Promise(r => setTimeout(r, 300));
    setUser({ id: 1, email, role: 'admin' });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
