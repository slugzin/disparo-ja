import React, { createContext, useContext, ReactNode } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}

interface UserContextType {
  user: User | null;
  isSubscribed: boolean;
  loading: boolean;
  signUp: (userData: { name: string; email: string; phone: string; cpf: string }) => Promise<{ success: boolean; error?: string }>;
  checkSubscription: () => void;
  // Propriedades para compatibilidade
  isFirstTime: boolean;
  canAccessContent: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};

export const UserProviderSimple: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();

  // Converter usuário do Clerk para o formato esperado
  const user: User | null = clerkUser && isSignedIn ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Usuário',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
    cpf: undefined
  } : null;

  // Com Clerk, verificamos se o usuário está autenticado
  const loading = !isLoaded;
  const isSubscribed = isSignedIn || false;

  const checkSubscription = () => {
    // Com Clerk, a assinatura é verificada pelo estado de autenticação
    // Pode ser expandido para verificar claims/metadata se necessário
  };

  const signUp = async (_userData: { name: string; email: string; phone: string; cpf: string }) => {
    // Com Clerk, o signup é feito via componente SignUp
    // Esta função é mantida para compatibilidade
    return {
      success: false,
      error: 'Use o formulário de cadastro do Clerk para criar uma conta.'
    };
  };

  const value: UserContextType = {
    user,
    isSubscribed,
    loading,
    signUp,
    checkSubscription,
    isFirstTime: !user,
    canAccessContent: () => Boolean(user && isSignedIn)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
