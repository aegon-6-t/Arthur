import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

/**
 * Contexte d'authentification pour gérer l'état utilisateur dans toute l'application (sessions)
 */
const AuthContext = createContext();

/** Hook pour consommer le contexte */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Vérification de la session au démarrage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.checkAuth();
        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  /** Connexion */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.data?.success) {
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error(response.data?.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  /** Déconnexion */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
    }
  };

  /** Inscription */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.data?.success) {
        // après inscription, rester sur la page login ou connecter automatiquement ?
        return response.data.user;
      }
      throw new Error(response.data?.message || "Inscription échouée");
    } finally {
      setLoading(false);
    }
  };

  /** Changer le mot de passe */
  const changePassword = async (oldPassword, newPassword) => {
    return authService.changePassword(oldPassword, newPassword);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    changePassword,
    isAuthenticated: () => !!user,
    isAdmin: () => user?.role === 'admin',
    checkAuth: async () => {
      const res = await authService.checkAuth();
      if (res.data?.success) setUser(res.data.user);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
