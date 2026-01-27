import React, { createContext, useContext, ReactNode } from "react";
import { useConvexAuth } from "../hooks/useConvexAuth";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  id?: Id<"profiles">;
  clerkId: string;
  email: string;
  nome: string;
  avatarUrl: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de ConvexUserProvider");
  }
  return context;
};

export const ConvexUserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading, signOut } = useConvexAuth();

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout: signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
