'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { api } from '@/lib/api/client';
import { getStoredToken, setStoredToken, clearStoredToken } from '@/lib/auth/token';
import type { components } from '@ezroot/openapi/generated/schema';

type User = components['schemas']['User'];

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getStoredToken(),
    loading: true,
  });

  const loadMe = useCallback(async (token: string) => {
    setStoredToken(token);
    const { data, error } = await api.GET('/me');
    if (error || !data) {
      clearStoredToken();
      setState((s) => ({ ...s, token: null, user: null, loading: false }));
      return;
    }
    setState((s) => ({ ...s, user: data, token, loading: false }));
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    loadMe(token).catch(() => setState((s) => ({ ...s, loading: false })));
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await api.POST('/auth/login', { body: { email, password } });
      if (error || !data?.access_token) {
        throw new Error(error ? getErrorMessage(error) : 'Login mislykkedes');
      }
      setStoredToken(data.access_token);
      setState({
        user: data.user ?? null,
        token: data.access_token,
        loading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setState({ user: null, token: null, loading: false });
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
