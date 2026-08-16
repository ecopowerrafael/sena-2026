import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SessionUser, UserRole } from "@sena/shared";
import { ApiRequestError, api } from "../../services/apiClient";

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Guarda apenas a sessão — dados de domínio continuam vindo dos hooks de cada feature
 * (ARCHITECTURE.md §4.1). O token nunca chega ao JavaScript: fica no cookie HttpOnly.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get<SessionUser>("/auth/me")
      .then((session) => {
        if (active) setUser(session);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.post<SessionUser>("/auth/login", { email, password });
    setUser(session);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Sessão já expirada no servidor: o efeito local é o mesmo.
      if (!(error instanceof ApiRequestError) || error.status !== 401) {
        throw error;
      }
    } finally {
      setUser(null);
    }
  }, []);

  const can = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo<AuthState>(
    () => ({ user, isLoading, login, logout, can }),
    [user, isLoading, login, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  }

  return context;
}
