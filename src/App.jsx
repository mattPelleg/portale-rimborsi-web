import React, { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Al caricamento della pagina: ripristina la sessione
    const restoreSession = async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
          // Prova a refreshare il token
          await authService.refreshAccessToken();
          console.log('✓ Sessione ripristinata');
        }
      } catch (error) {
        console.log('Sessione scaduta, login richiesto');
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Mentre verifichiamo la sessione, mostra un loader
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Caricamento...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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