import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ensureShareLink,
  fetchMe,
  getToken,
  login as apiLogin,
  regenerateShareLink,
  register as apiRegister,
  setToken,
} from '../api';
import type { User } from '../types';

function normalizeUser(user: User): User {
  return {
    ...user,
    shareSlug: user.shareSlug ?? '',
  };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  ensureShareSlug: () => Promise<string>;
  regenerateShareSlug: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    const { user: me } = await fetchMe();
    const next = normalizeUser(me);
    setUser(next);
    return next;
  }, []);

  const ensureShareSlug = useCallback(async () => {
    try {
      const { user: nextRaw } = await ensureShareLink();
      const next = normalizeUser(nextRaw);
      setUser(next);
      return next.shareSlug;
    } catch {
      const refreshed = await refreshUser();
      return refreshed?.shareSlug ?? '';
    }
  }, [refreshUser]);

  const regenerateShareSlug = useCallback(async () => {
    const { user: nextRaw } = await regenerateShareLink();
    const next = normalizeUser(nextRaw);
    setUser(next);
    return next.shareSlug;
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    void fetchMe()
      .then(async ({ user: me }) => {
        let next = normalizeUser(me);
        if (!next.shareSlug) {
          try {
            const ensured = await ensureShareLink();
            next = normalizeUser(ensured.user);
          } catch {
            /* older API without share-link — keep empty until deploy/login */
          }
        }
        setUser(next);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: next } = await apiLogin({ email, password });
    setToken(token);
    setUser(normalizeUser(next));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: next } = await apiRegister({ name, email, password });
    setToken(token);
    setUser(normalizeUser(next));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      ensureShareSlug,
      regenerateShareSlug,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      ensureShareSlug,
      regenerateShareSlug,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
