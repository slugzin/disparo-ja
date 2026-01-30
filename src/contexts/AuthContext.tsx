import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  id: Id<"users">;
  email: string;
  nome: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, senha: string, nome: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "prospect_user";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.mutations.users.login);
  const registerMutation = useMutation(api.mutations.users.register);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginMutation({ email, senha });

      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id as Id<"users">,
          email: result.user.email,
          nome: result.user.nome,
          role: result.user.role as "admin" | "user",
        };

        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        return { success: true };
      }

      return { success: false, error: "Erro ao fazer login" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login";
      return { success: false, error: message };
    }
  };

  const register = async (email: string, senha: string, nome: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerMutation({ email, senha, nome });

      if (result.success) {
        // Fazer login automaticamente após registro
        return await login(email, senha);
      }

      return { success: false, error: "Erro ao cadastrar" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
