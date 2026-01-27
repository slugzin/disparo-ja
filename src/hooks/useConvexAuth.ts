import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface Profile {
  _id: Id<"profiles">;
  clerkId: string;
  email: string;
  nome?: string;
  avatarUrl?: string;
  createdAt: number;
}

export function useConvexAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useClerkUser();
  const { signOut } = useClerkAuth();

  // Buscar perfil do Convex
  const profile = useQuery(
    api.queries.profiles.getCurrentProfile,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Mutation para criar/atualizar perfil
  const createOrUpdateProfile = useMutation(api.mutations.profiles.createOrUpdate);

  // Sincronizar perfil do Clerk com Convex
  useEffect(() => {
    if (isSignedIn && clerkUser && profile === null) {
      // Perfil não existe, criar
      createOrUpdateProfile({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        nome: clerkUser.fullName || clerkUser.firstName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });
    }
  }, [isSignedIn, clerkUser, profile, createOrUpdateProfile]);

  const isLoading = !isClerkLoaded || (isSignedIn && profile === undefined);

  const user = useMemo(() => {
    if (!isSignedIn || !clerkUser) return null;

    return {
      id: profile?._id,
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      nome: profile?.nome || clerkUser.fullName || clerkUser.firstName || "",
      avatarUrl: profile?.avatarUrl || clerkUser.imageUrl || "",
    };
  }, [isSignedIn, clerkUser, profile]);

  return {
    user,
    profile,
    isAuthenticated: isSignedIn && !!profile,
    isLoading,
    signOut: () => signOut(),
  };
}

// Hook simplificado para uso geral
export function useAuth() {
  const { user, isAuthenticated, isLoading, signOut } = useConvexAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: signOut,
  };
}
