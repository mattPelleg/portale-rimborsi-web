import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./components/homepage/HomePage";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ClientiPage from "./components/clientiPage/clientiPage";
import DettaglioClientePage from "./components/dettaglioClientePage/DettaglioClientePage";
import InserisciClientePage from "./components/inserisciClientePage/inserisciClientePage";
import ModuliPage from "./components/moduliPage/moduliPage";
import InserisciModuloPage from "./components/inserisciModuloPage/inserisciModuloPage";
import DettaglioModuloPage from "./components/dettaglioModuloPage/DettaglioModuloPage";
import PratichePage from "./components/pratichePage/PratichePage";
import DettaglioPraticaPage from "./components/dettaglioPraticaPage/DettaglioPraticaPage";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";

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
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginRoute />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clienti" element={<ProtectedRoute><ClientiPage /></ProtectedRoute>} />
        <Route path="/clienti/nuovo" element={<ProtectedRoute><InserisciClientePage /></ProtectedRoute>} />
        <Route path="/clienti/:id" element={<ProtectedRoute><DettaglioClientePage /></ProtectedRoute>} />
        <Route path="/moduli" element={<ProtectedRoute><ModuliPage /></ProtectedRoute>} />
        <Route path="/moduli/nuovo" element={<ProtectedRoute><InserisciModuloPage /></ProtectedRoute>} />
        <Route path="/moduli/:id" element={<ProtectedRoute><DettaglioModuloPage /></ProtectedRoute>} />
        <Route path="/pratiche" element={<ProtectedRoute><PratichePage /></ProtectedRoute>} />
        <Route path="/pratiche/:id" element={<ProtectedRoute><DettaglioPraticaPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;