import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponse, AuthTokenResponse, PersonaResponse } from '../types/schema';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, courseId?: string) => Promise<boolean>;
  logout: () => void;
  switchPersona: (personaId: string) => Promise<boolean>;
  personas: PersonaResponse[];
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PERSONAS: PersonaResponse[] = [
  {
    id: 'std_rahul_99',
    email: 'rahul@edutrace.ai',
    name: 'Rahul Sharma',
    role: 'student',
    primary_course_id: 'course_calc_301',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    headline: 'Calculus III • Procedural Calculation & Bracket Inversion Focus',
    baseline_readiness: 55.4,
  },
  {
    id: 'std_priya_88',
    email: 'priya@edutrace.ai',
    name: 'Priya Patel',
    role: 'student',
    primary_course_id: 'course_econ_macro',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    headline: 'Macroeconomics • Crowding-Out Effect & Fiscal Policy Remediation',
    baseline_readiness: 58.0,
  },
  {
    id: 'std_alex_77',
    email: 'alex@edutrace.ai',
    name: 'Alex Chen',
    role: 'student',
    primary_course_id: 'course_cs_210',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    headline: 'Data Structures • Loop Invariant & Binary Search Termination',
    baseline_readiness: 62.5,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<PersonaResponse[]>(DEFAULT_PERSONAS);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('edutrace_token');
      const savedUserStr = localStorage.getItem('edutrace_user');
      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      } else {
        // Default to pre-seeded Rahul for seamless live demo inspection
        const defaultUser: UserResponse = {
          id: 'std_rahul_99',
          email: 'rahul@edutrace.ai',
          name: 'Rahul Sharma',
          role: 'student',
          primary_course_id: 'course_calc_301',
          avatar_url: DEFAULT_PERSONAS[0].avatar_url,
        };
        setUser(defaultUser);
        setToken('dev_token_rahul_default');
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }

    // Fetch live personas from backend
    fetch('/api/auth/personas')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setPersonas(data);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.detail || 'Invalid email or password.');
        return false;
      }

      const data: AuthTokenResponse = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('edutrace_token', data.access_token);
      localStorage.setItem('edutrace_user', JSON.stringify(data.user));
      return true;
    } catch (e: any) {
      setAuthError('Unable to connect to authentication server.');
      return false;
    }
  };

  const register = async (
    email: string,
    name: string,
    password: string,
    courseId?: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          primary_course_id: courseId || null,
          role: 'student',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.detail || 'Registration failed. Email may already be in use.');
        return false;
      }

      const data: AuthTokenResponse = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('edutrace_token', data.access_token);
      localStorage.setItem('edutrace_user', JSON.stringify(data.user));
      localStorage.removeItem('edutrace_active_course');
      return true;
    } catch {
      setAuthError('Registration server offline.');
      return false;
    }
  };

  const switchPersona = async (personaId: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch(`/api/auth/switch-persona/${personaId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data: AuthTokenResponse = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('edutrace_token', data.access_token);
        localStorage.setItem('edutrace_user', JSON.stringify(data.user));
        return true;
      }
    } catch {
      // Local fallback
    }

    const matched = personas.find((p) => p.id === personaId);
    if (matched) {
      const fallbackUser: UserResponse = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: 'student',
        primary_course_id: matched.primary_course_id,
        avatar_url: matched.avatar_url,
      };
      setUser(fallbackUser);
      setToken(`token_${matched.id}`);
      localStorage.setItem('edutrace_token', `token_${matched.id}`);
      localStorage.setItem('edutrace_user', JSON.stringify(fallbackUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edutrace_token');
    localStorage.removeItem('edutrace_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        personas,
        authError,
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
