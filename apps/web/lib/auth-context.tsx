'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStore } from './api';
import type { AuthResponse, AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate session from storage, then verify against the API.
    const cached = tokenStore.user;
    if (cached && tokenStore.access) {
      setUser(cached);
      api<AuthUser>('/auth/me')
        .then((me) => setUser(me))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api<AuthResponse>('/auth/signin', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    tokenStore.save(res.accessToken, res.refreshToken, { id: res.id, name: res.name, roles: res.roles });
    const me = await api<AuthUser>('/auth/me');
    tokenStore.save(res.accessToken, res.refreshToken, me);
    setUser(me);
  }

  async function logout() {
    try {
      await api('/auth/signout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }

  const hasPermission = (permission: string) => !!user?.permissions?.includes(permission);
  const hasRole = (...roles: string[]) => !!user?.roles?.some((r) => roles.includes(r));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
