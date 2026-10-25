import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";
import type { AuthUser, AuthFormData, RegisterFormData } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session when the application starts.
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.me();
      setUser(response.data);
    } catch {
      // No valid session, or the user could not be loaded.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (data: AuthFormData): Promise<void> => {
    const response = await authService.login(data);
    setUser(response.data.user);
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    const response = await authService.register(data);
    setUser(response.data.user);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
