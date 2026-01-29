import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { AdminProvider } from "./context/AdminContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FiltrosProvider } from "./contexts/FiltrosContext";

import HomePage from "./pages/HomePage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import EmpresasPage from "./pages/admin/EmpresasPage";
import ConexoesPage from "./pages/admin/ConexoesPage";
import DisparosPage from "./pages/admin/DisparosPage";
import DisparosHistoricoPage from "./pages/admin/DisparosHistoricoPage";
import ConversasPage from "./pages/admin/ConversasPage";
import FluxosPage from "./pages/admin/FluxosPage";

// ============================================
// MODO DE TESTE - CLERK DESATIVADO
// Para reativar o Clerk, mude para false
const DISABLE_CLERK = true;
// ============================================

// Configuração do Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<HomePage />} />

        {/* Login temporário - redireciona direto para admin */}
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/cadastro" element={<Navigate to="/admin" replace />} />

        {/* Admin Routes - SEM proteção durante testes */}
        <Route path="/admin" element={<AdminLayout />}>
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
  // Modo de teste sem Clerk
  if (DISABLE_CLERK) {
    return (
      <ConvexProvider client={convex}>
        <ThemeProvider>
          <AdminProvider>
            <FiltrosProvider>
              <AppRoutes />
            </FiltrosProvider>
          </AdminProvider>
        </ThemeProvider>
      </ConvexProvider>
    );
  }

  // Modo normal com Clerk (desativado temporariamente)
  // Para reativar, mude DISABLE_CLERK para false e descomente o código abaixo
  /*
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
  */

  return null;
}

export default App;
