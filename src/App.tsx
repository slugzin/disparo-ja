import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/clerk-react";

import { AdminProvider } from "./context/AdminContext";
import { ConvexUserProvider } from "./contexts/ConvexUserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FiltrosProvider } from "./contexts/FiltrosContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./pages/HomePage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import EmpresasPage from "./pages/admin/EmpresasPage";
import ConexoesPage from "./pages/admin/ConexoesPage";
import DisparosPage from "./pages/admin/DisparosPage";
import BancoDadosPage from "./pages/admin/BancoDadosPage";
import DisparosHistoricoPage from "./pages/admin/DisparosHistoricoPage";
import ConversasPage from "./pages/admin/ConversasPage";
import FluxosPage from "./pages/admin/FluxosPage";

// Configuração do Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Chave pública do Clerk
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

// Componente de layout para autenticação
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<HomePage />} />

        {/* Páginas de autenticação Clerk */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <SignIn routing="path" path="/login" afterSignInUrl="/admin" />
            </AuthLayout>
          }
        />
        <Route
          path="/cadastro"
          element={
            <AuthLayout>
              <SignUp routing="path" path="/cadastro" afterSignUpUrl="/admin" />
            </AuthLayout>
          }
        />

        {/* Admin Routes - Protegidas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="disparos" element={<DisparosPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="fluxos" element={<FluxosPage />} />
          <Route path="conexoes" element={<ConexoesPage />} />
          <Route path="campanhas" element={<DisparosHistoricoPage />} />
          <Route path="conversas" element={<ConversasPage />} />
        </Route>

        {/* Rota catch-all para redirecionar para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider>
          <ConvexUserProvider>
            <AdminProvider>
              <FiltrosProvider>
                <AppRoutes />
              </FiltrosProvider>
            </AdminProvider>
          </ConvexUserProvider>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default App;
