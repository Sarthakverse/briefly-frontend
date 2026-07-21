import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import {
  loginUser,
  registerUser,
  getProfile,
  refreshAccessToken,
  logoutApi,
} from '../features/auth/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  department?: string;
  designation?: string;
  phone?: string;
  officeLocation?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      getProfile()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            refreshAccessToken(refreshToken)
              .then((res) => {
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('refreshToken', res.refreshToken);
                setUser(res.user);
              })
              .catch(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
              });
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);

    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);

    setUser(res.user);
  };

  const register = async (data: SignupData) => {
    const payload = {
      email: data.email,
      password: data.password,
      name: data.name,
      department: data.department || '',
      designation: data.designation || '',
      phone: data.phone || '',
      officeLocation: data.officeLocation || '',
    };

    const res = await registerUser(payload);

    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);

    setUser(res.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}