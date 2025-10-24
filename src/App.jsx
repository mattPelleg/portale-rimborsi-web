import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./components/homepage/HomePage";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotta pubblica - Homepage */}
        <Route path="/" element={<Homepage />} />
        
        {/* Rotta pubblica - Login */}
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } 
        />
        
        {/* Rotta protetta - Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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