import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./components/homepage/HomePage";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ClientiPage from "./components/clientiPage/clientiPage";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";

// Componente separato per gestire il redirect da /login
// Si ri-valuta ad ogni render invece di una sola volta al mount
function LoginRoute() {
  return authService.isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Login />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotta pubblica - Homepage */}
        <Route path="/" element={<Homepage />} />

        {/* Rotta pubblica - Login */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Rotte protette */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clienti"
          element={
            <ProtectedRoute>
              <ClientiPage />
            </ProtectedRoute>
          }
        />

        {/* Rotta 404 - Pagina non trovata */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;