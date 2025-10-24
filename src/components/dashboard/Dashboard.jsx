import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { LogOut, User, Home } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Dashboard - Portale Rimborsi</h1>
          <div className="dashboard-header-actions">
            <button onClick={handleGoHome} className="dashboard-btn dashboard-btn-secondary">
              <Home size={18} />
              Home
            </button>
            <button onClick={handleLogout} className="dashboard-btn dashboard-btn-logout">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {user && (
          <div className="dashboard-welcome-card">
            <div className="welcome-card-header">
              <User size={24} className="welcome-icon" />
              <div>
                <h2 className="welcome-title">Benvenuto, {user.username}!</h2>
                <p className="welcome-subtitle">Email: {user.email}</p>
                <p className="welcome-roles">Ruoli: {user.ruoli?.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Funzionalità disponibili:</h3>
          <ul className="dashboard-features-list">
            <li>📋 Gestione rimborsi</li>
            <li>👁️ Visualizza pratiche</li>
            <li>📊 Report e statistiche</li>
            <li>⚙️ Impostazioni account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;