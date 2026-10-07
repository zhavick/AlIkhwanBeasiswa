import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  userId: number;
  username: string;
  email: string;
  namaLengkap: string;
  roles: string[];
  permissions: string[];
  profileType?: string; // Pengurus, Mahasiswa, Siswa
  profileId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoginModalOpen: boolean;
  redirectPathAfterLogin: string | null;
  openLoginModal: (redirectAfterLogin?: string) => void;
  closeLoginModal: () => void;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  registerPenerima: (data: any) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [redirectPathAfterLogin, setRedirectPathAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const openLoginModal = (redirectAfterLogin?: string) => {
    if (redirectAfterLogin) {
      setRedirectPathAfterLogin(redirectAfterLogin);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setRedirectPathAfterLogin(null);
  };

  const login = async (usernameOrEmail: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    const data = response.data;

    const userData: User = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      namaLengkap: data.namaLengkap,
      roles: data.roles || [],
      permissions: data.permissions || [],
      profileType: data.profileType,
      profileId: data.profileId,
    };

    setToken(data.token);
    setUser(userData);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));

    setIsLoginModalOpen(false);
    return userData;
  };

  const registerPenerima = async (data: any) => {
    const response = await api.post('/auth/register-penerima', data);
    const resData = response.data;

    const userData: User = {
      userId: resData.userId,
      username: resData.username,
      email: resData.email,
      namaLengkap: resData.namaLengkap,
      roles: resData.roles || [],
      permissions: resData.permissions || [],
      profileType: resData.profileType,
      profileId: resData.profileId,
    };

    setToken(resData.token);
    setUser(userData);

    localStorage.setItem('token', resData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/portal';
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    if (user.roles.includes('SuperAdmin')) return true;
    return user.roles.includes(role);
  };

  const hasPermission = (permissionCode: string) => {
    if (!user) return false;
    if (user.roles.includes('SuperAdmin')) return true;
    return user.permissions.includes(permissionCode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        isLoginModalOpen,
        redirectPathAfterLogin,
        openLoginModal,
        closeLoginModal,
        login,
        registerPenerima,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
