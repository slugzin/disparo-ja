import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FiltrosProvider } from "./contexts/FiltrosContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import EmpresasPage from "./pages/admin/EmpresasPage";
import ConexoesPage from "./pages/admin/ConexoesPage";
import DisparosPage from "./pages/admin/DisparosPage";
import DisparosHistoricoPage from "./pages/admin/DisparosHistoricoPage";
import ConversasPage from "./pages/admin/ConversasPage";
import FluxosPage from "./pages/admin/FluxosPage";

// Configuracao do Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Pagina inicial */}
        <Route path="/" element={<HomePage />} />

        {/* Login e Cadastro */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

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
    <ConvexProvider client={convex}>
      <AuthProvider>
        <ThemeProvider>
          <AdminProvider>
            <FiltrosProvider>
              <AppRoutes />
            </FiltrosProvider>
          </AdminProvider>
        </ThemeProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}

export default App;
