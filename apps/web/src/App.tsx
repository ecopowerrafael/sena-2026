import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SenaCrmApp } from "./components/senaCrm/SenaCrmApp";
import { AuthProvider } from "./features/auth/AuthProvider";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DEFAULT_PATH } from "./routes/senaRoutes";

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
          {/* Rota única protegida: o shell permanece montado e a tab ativa vem da URL. */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SenaCrmApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
